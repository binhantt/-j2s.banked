package com.example.bankend_hovan_J2.infrastructure.security;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtAuthenticationFilter(JwtProvider jwtProvider,
                                  UserRepository userRepository,
                                  TokenBlacklistService tokenBlacklistService) {
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtProvider.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // --- Blacklist check (SC-02) ---
            String jti = jwtProvider.getJtiFromToken(token);
            if (tokenBlacklistService != null && tokenBlacklistService.isBlacklisted(jti)) {
                // Token đã bị revoke — coi như invalid
                filterChain.doFilter(request, response);
                return;
            }

            Long userId = jwtProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Check if account is active (skip for admin users)
            boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                             "super_admin".equalsIgnoreCase(user.getUserType());

            if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> body = Map.of(
                    "banned", true,
                    "message", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
                );
                objectMapper.writeValue(response.getOutputStream(), body);
                return;
            }

            // Set authentication in security context
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    user.getId(),
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getUserType().toUpperCase()))
                );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            filterChain.doFilter(request, response);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }
}
