package com.example.bankend_hovan_J2.presentation.auth;

import com.example.bankend_hovan_J2.application.auth.AuthResponseDTO;
import com.example.bankend_hovan_J2.presentation.auth.GoogleLoginRequest;
import com.example.bankend_hovan_J2.application.auth.FacebookLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.GitHubLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.GoogleLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.PasswordLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.RefreshTokenService;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import com.example.bankend_hovan_J2.infrastructure.security.TokenBlacklistService;
import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

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

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  🚀 MOCK TEST ENDPOINT — KHÔNG DÙNG PRODUCTION              ║
    // ║  Test flow login mà không cần Google idToken thật           ║
    // ╚══════════════════════════════════════════════════════════════╝
    @PostMapping("/google/mock")
    public ResponseEntity<AuthResponseDTO> googleLoginMock(@RequestBody GoogleLoginRequest request,
                                                            HttpServletRequest httpRequest) {
        System.out.println("╔══════════════════════════════════════════════════════╗");
        System.out.println("║  🚀 GOOGLE LOGIN MOCK — TEST FLOW START               ║");
        System.out.println("╚══════════════════════════════════════════════════════╝");

        // Step 1: Simulate extracted user info (thay bằng dữ liệu test)
        String mockEmail = "mockuser_" + System.currentTimeMillis() + "@gmail.com";
        String mockName = "Mock Test User";
        String mockProviderId = "google_mock_" + System.currentTimeMillis();
        String userType = request.getUserType() != null ? request.getUserType() : "candidate";

        System.out.println("📋 [STEP 1] Mock user info extracted:");
        System.out.println("   - email: " + mockEmail);
        System.out.println("   - name: " + mockName);
        System.out.println("   - providerId: " + mockProviderId);
        System.out.println("   - userType: " + userType);

        // Step 2: Find or create user in DB
        System.out.println("🔍 [STEP 2] Looking up user by provider='google', providerId='" + mockProviderId + "'...");
        User user = userRepository.findByProviderAndProviderId("google", mockProviderId)
                .orElseGet(() -> {
                    System.out.println("🆕 [STEP 2] User NOT FOUND — creating new user");
                    User newUser = new User(
                            new Email(mockEmail),
                            mockName,
                            "google",
                            mockProviderId,
                            userType
                    );
                    User saved = userRepository.save(newUser);
                    System.out.println("✅ [STEP 2] New user CREATED with id=" + saved.getId());
                    return saved;
                });

        if (user.getId() != null) {
            System.out.println("👤 [STEP 2] Existing user found: id=" + user.getId() +
                    ", email=" + user.getEmail().getValue() +
                    ", userType=" + user.getUserType() +
                    ", isActive=" + user.getIsActive());
        }

        // Step 3: Check isActive (skip cho admin)
        boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                         "super_admin".equalsIgnoreCase(user.getUserType());
        System.out.println("🔒 [STEP 3] isAdmin=" + isAdmin + ", isActive=" + user.getIsActive());

        if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
            System.out.println("❌ [STEP 3] Account BANNED — userId=" + user.getId());
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        // Step 4: Generate JWT access token
        System.out.println("🔑 [STEP 4] Generating JWT access token for userId=" + user.getId() + "...");
        String accessToken = jwtProvider.generateAccessToken(
                user.getId(),
                user.getEmail().getValue(),
                user.getUserType()
        );
        System.out.println("✅ [STEP 4] JWT access token generated (length=" + accessToken.length() + ")");
        System.out.println("   TOKEN: " + accessToken);

        // Step 5: Save refresh token
        System.out.println("💾 [STEP 5] Saving refresh token to DB...");
        String deviceInfo = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIP(httpRequest);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId(), deviceInfo, ipAddress);
        System.out.println("✅ [STEP 5] Refresh token saved (length=" + refreshToken.length() + ")");
        System.out.println("   REFRESH_TOKEN: " + refreshToken);

        AuthResponseDTO response = new AuthResponseDTO(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail().getValue(),
                user.getName(),
                user.getAvatarUrl(),
                user.getUserType()
        );

        System.out.println("╔══════════════════════════════════════════════════════╗");
        System.out.println("║  🎉 GOOGLE LOGIN MOCK — TEST FLOW COMPLETE           ║");
        System.out.println("╚══════════════════════════════════════════════════════╝");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody GoogleLoginRequest request,
                                                        HttpServletRequest httpRequest) {
        log.info("[AuthController] 🟢 POST /api/auth/google — userType: {}", request.getUserType());
        log.info("[AuthController] idToken null: {}, length: {}",
                request.getIdToken() == null,
                request.getIdToken() != null ? request.getIdToken().length() : 0);
        log.info("[AuthController] clientIp: {}, userAgent: {}", getClientIP(httpRequest), httpRequest.getHeader("User-Agent"));

        try {
            AuthResponseDTO response = googleLoginUseCase.execute(request.getIdToken(), request.getUserType());
            log.info("[AuthController] ✅ googleLoginUseCase.execute() SUCCESS — userId: {}, email: {}",
                    response.getUserId(), response.getEmail());
            saveRefreshToken(response, httpRequest);
            log.info("[AuthController] 🎉 Google login COMPLETE — returning 200");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[AuthController] ❌ Google login FAILED: {} — {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }
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

            // Lấy user từ token
            Long userId = jwtProvider.getUserIdFromToken(oldRefreshToken);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check isActive TRƯỚC KHI rotate — tài khoản bị khóa → trả 403 banned
            // Chỉ super_admin được bypass
            boolean isSuperAdmin = "super_admin".equalsIgnoreCase(user.getUserType());
            if (!isSuperAdmin && user.getIsActive() != null && !user.getIsActive()) {
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
