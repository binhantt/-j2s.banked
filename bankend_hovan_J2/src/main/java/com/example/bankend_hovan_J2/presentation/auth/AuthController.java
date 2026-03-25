package com.example.bankend_hovan_J2.presentation.auth;

import com.example.bankend_hovan_J2.application.auth.AuthResponseDTO;
import com.example.bankend_hovan_J2.application.auth.FacebookLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.GitHubLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.GoogleLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.PasswordLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.RefreshTokenService;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import com.example.bankend_hovan_J2.infrastructure.security.TokenBlacklistService;
import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final GoogleLoginUseCase googleLoginUseCase;
    private final GitHubLoginUseCase gitHubLoginUseCase;
    private final FacebookLoginUseCase facebookLoginUseCase;
    private final PasswordLoginUseCase passwordLoginUseCase;
    private final RefreshTokenService refreshTokenService;
    private final JwtProvider jwtProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    public AuthController(GoogleLoginUseCase googleLoginUseCase,
                          GitHubLoginUseCase gitHubLoginUseCase,
                          FacebookLoginUseCase facebookLoginUseCase,
                          PasswordLoginUseCase passwordLoginUseCase,
                          RefreshTokenService refreshTokenService,
                          JwtProvider jwtProvider,
                          TokenBlacklistService tokenBlacklistService,
                          UserRepository userRepository) {
        this.googleLoginUseCase = googleLoginUseCase;
        this.gitHubLoginUseCase = gitHubLoginUseCase;
        this.facebookLoginUseCase = facebookLoginUseCase;
        this.passwordLoginUseCase = passwordLoginUseCase;
        this.refreshTokenService = refreshTokenService;
        this.jwtProvider = jwtProvider;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userRepository = userRepository;
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth API is working!");
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody GoogleLoginRequest request,
                                                        HttpServletRequest httpRequest) {
        AuthResponseDTO response = googleLoginUseCase.execute(request.getIdToken(), request.getUserType());
        // Lưu refresh token vào DB
        saveRefreshToken(response, httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/github")
    public ResponseEntity<AuthResponseDTO> githubLogin(@RequestBody GitHubLoginRequest request,
                                                        HttpServletRequest httpRequest) {
        AuthResponseDTO response = gitHubLoginUseCase.execute(request.getCode(), request.getUserType());
        saveRefreshToken(response, httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/facebook")
    public ResponseEntity<AuthResponseDTO> facebookLogin(@RequestBody FacebookLoginRequest request,
                                                          HttpServletRequest httpRequest) {
        AuthResponseDTO response = facebookLoginUseCase.execute(request.getAccessToken(), request.getUserType());
        saveRefreshToken(response, httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginByPassword(@RequestBody PasswordLoginRequest request,
                                             HttpServletRequest httpRequest) {
        try {
            AuthResponseDTO response = passwordLoginUseCase.execute(request.getEmail(), request.getPassword());
            saveRefreshToken(response, httpRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message != null && message.contains("bị khóa")) {
                return ResponseEntity.status(403)
                    .body(Map.of("banned", true, "message", message));
            }
            return ResponseEntity.status(401).body(Map.of("message", message));
        }
    }

    /**
     * Refresh token — dùng rotation (revoke token cũ, tạo cặp token mới).
     * Refresh token chỉ dùng được 1 lần.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request,
                                           HttpServletRequest httpRequest) {
        try {
            String oldRefreshToken = request.getRefreshToken();

            // Validate refresh token signature + expiry
            if (!jwtProvider.validateRefreshToken(oldRefreshToken)) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Refresh token không hợp lệ hoặc đã hết hạn"
                ));
            }

            // Lấy user từ token (KHÔNG dùng token đã revoked/used)
            Long userId = jwtProvider.getUserIdFromToken(oldRefreshToken);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ╔══════════════════════════════════════════════════════╗
            // ║  FIX LỖI 2: Check isActive TRƯỚC KHI rotate token  ║
            // ║  Admin khóa tài khoản → trả 403 banned → frontend ║
            // ║  auto-logout thay vì tiếp tục dùng app             ║
            // ╚══════════════════════════════════════════════════════╝
            boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                             "super_admin".equalsIgnoreCase(user.getUserType());
            if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
                return ResponseEntity.status(403)
                    .body(Map.of(
                        "banned", true,
                        "message", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
                    ));
            }

            String deviceInfo = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIP(httpRequest);

            // Kiểm tra refresh token CHƯA bị revoke/used TRƯỚC KHI rotate
            String hash = refreshTokenService.hashTokenForRefresh(oldRefreshToken);
            var existingToken = refreshTokenService.findByTokenHash(hash);
            if (existingToken.isEmpty() || existingToken.get().isRevoked() || existingToken.get().isUsed()) {
                // Token đã bị dùng/revoke → trả 401 (không phải banned, chỉ là hết phiên)
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                ));
            }

            // Rotation: revoke old token, create new pair
            RefreshTokenService.TokenPair tokens = refreshTokenService.rotateRefreshToken(
                    oldRefreshToken,
                    user.getEmail().getValue(),
                    user.getUserType(),
                    deviceInfo,
                    ipAddress
            );

            return ResponseEntity.ok(new AuthResponseDTO(
                    tokens.accessToken(),
                    tokens.refreshToken(),
                    user.getId(),
                    user.getEmail().getValue(),
                    user.getName(),
                    user.getAvatarUrl(),
                    user.getUserType()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Logout — revoke refresh token và blacklist access token.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request,
                                    HttpServletRequest httpRequest) {
        // Blacklist access token hiện tại
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            try {
                String jti = jwtProvider.getJtiFromToken(accessToken);
                Date expiry = jwtProvider.getExpirationFromToken(accessToken);
                long expirySeconds = expiry.getTime() / 1000;
                tokenBlacklistService.blacklistToken(jti, expirySeconds);
            } catch (Exception e) {
                // Token có thể đã hết hạn hoặc không parse được — bỏ qua
            }
        }

        // Revoke refresh token
        refreshTokenService.revokeRefreshToken(request.getRefreshToken());

        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    private void saveRefreshToken(AuthResponseDTO response, HttpServletRequest request) {
        if (response == null || response.getUserId() == null) return;
        String deviceInfo = request.getHeader("User-Agent");
        String ipAddress = getClientIP(request);
        String refreshToken = refreshTokenService.createRefreshToken(
                response.getUserId(), deviceInfo, ipAddress);
        response.setRefreshToken(refreshToken);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        return (xfHeader == null || xfHeader.isBlank())
                ? request.getRemoteAddr()
                : xfHeader.split(",")[0];
    }
}
