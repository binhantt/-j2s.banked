package com.example.bankend_hovan_J2.infrastructure.connection;

import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CONNECTION LIMIT FILTER — Áp dụng connection limit trên mỗi request    ║
 * ║                                                                      ║
 * ║  1. Extract userId từ JWT Authorization header                        ║
 * ║  2. Gọi limiter.tryAcquire(userId) → false → 429 Too Many Connections ║
 * ║  3. chain.doFilter()                                                   ║
 * ║  4. finally → limiter.release(userId)                                 ║
 * ║                                                                      ║
 * ║  Request không có token → bỏ qua (public endpoint)                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
@Component
public class ConnectionLimitFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(ConnectionLimitFilter.class);

    private final ConnectionLimiterService limiter;
    private final JwtProvider jwtProvider;

    public ConnectionLimitFilter(ConnectionLimiterService limiter, JwtProvider jwtProvider) {
        this.limiter = limiter;
        this.jwtProvider = jwtProvider;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // ── Lấy userId từ JWT token ──
        Long userId = extractUserId(req);
        if (userId == null) {
            // Không có token → public endpoint → bỏ qua giới hạn
            chain.doFilter(request, response);
            return;
        }

        // ── Thử chiếm connection slot ──
        if (!limiter.tryAcquire(userId)) {
            resp.setStatus(429);
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.setHeader("Retry-After", "5");
            resp.setHeader("X-ConnectionLimit-Max", String.valueOf(limiter.getMaxConcurrent()));

            String json = """
                {"error":"Quá nhiều yêu cầu đồng thời. Vui lòng chờ vài giây.",
                 "code":"TOO_MANY_CONNECTIONS","maxConcurrent":%d}
                """.formatted(limiter.getMaxConcurrent());

            log.debug("[ConnectionLimit] Rejected userId={} — too many concurrent requests", userId);
            resp.getWriter().write(json);
            return;
        }

        try {
            chain.doFilter(request, response);
        } finally {
            // ── Luôn giải phóng slot khi request xong ──
            limiter.release(userId);
        }
    }

    /**
     * Trích xuất userId từ Authorization: Bearer {token}.
     *
     * @return userId hoặc null nếu không có / không hợp lệ
     */
    private Long extractUserId(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = header.substring(7);
            if (!jwtProvider.validateToken(token)) {
                return null;
            }
            return jwtProvider.getUserIdFromToken(token);
        } catch (Exception e) {
            log.trace("[ConnectionLimit] Token extraction failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("[ConnectionLimit] Filter initialized. Max concurrent per user: {}",
                 limiter.getMaxConcurrent());
    }

    @Override
    public void destroy() {
        log.info("[ConnectionLimit] Filter destroyed.");
    }
}
