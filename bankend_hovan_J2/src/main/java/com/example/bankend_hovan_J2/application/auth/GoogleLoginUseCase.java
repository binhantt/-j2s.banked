package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import com.example.bankend_hovan_J2.infrastructure.oauth.GoogleTokenVerifier;
import com.example.bankend_hovan_J2.infrastructure.oauth.GoogleTokenVerifier.GooglePayload;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoogleLoginUseCase {

    private static final Logger log = LoggerFactory.getLogger(GoogleLoginUseCase.class);

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public GoogleLoginUseCase(GoogleTokenVerifier googleTokenVerifier,
                             UserRepository userRepository,
                             JwtProvider jwtProvider) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    @Transactional
    public AuthResponseDTO execute(String idToken, String userType) {
        log.info("[GoogleLoginUseCase] 🚀 execute() START — userType: {}", userType);
        log.info("[GoogleLoginUseCase] idToken null: {}, length: {}",
                idToken == null, idToken != null ? idToken.length() : 0);

        // 1. Verify Google token (GIS One Tap credential)
        log.info("[GoogleLoginUseCase] 🔍 Step 1: Verifying Google idToken...");
        GooglePayload payload;
        try {
            payload = googleTokenVerifier.verify(idToken);
            log.info("[GoogleLoginUseCase] ✅ Step 1 PASSED — token verified");
        } catch (Exception e) {
            log.error("[GoogleLoginUseCase] ❌ Step 1 FAILED — token verification error: {}", e.getMessage());
            throw e;
        }

        // 2. Extract user info
        String googleId = payload.subject();
        String email = payload.email();
        String name = payload.name();
        String avatarUrl = payload.picture();
        log.info("[GoogleLoginUseCase] 📋 Extracted user info:");
        log.info("[GoogleLoginUseCase]   googleId: {}", googleId);
        log.info("[GoogleLoginUseCase]   email: {}", email);
        log.info("[GoogleLoginUseCase]   name: {}", name);
        log.info("[GoogleLoginUseCase]   avatarUrl: {}", avatarUrl);

        // 3. Find or create user
        log.info("[GoogleLoginUseCase] 🔍 Step 2: Looking up user by provider='google', providerId='{}'...", googleId);
        User user = userRepository.findByProviderAndProviderId("google", googleId)
                .orElseGet(() -> {
                    log.info("[GoogleLoginUseCase] 🆕 User NOT FOUND — creating new user with userType='{}'", userType);
                    User newUser = new User(
                        new Email(email),
                        name,
                        "google",
                        googleId,
                        userType
                    );
                    newUser.setAvatarUrl(avatarUrl);
                    User saved = userRepository.save(newUser);
                    log.info("[GoogleLoginUseCase] ✅ New user CREATED with id={}", saved.getId());
                    return saved;
                });

        if (user.getId() != null) {
            log.info("[GoogleLoginUseCase] 👤 Existing user found: id={}, email={}, userType={}, isActive={}",
                    user.getId(), user.getEmail().getValue(), user.getUserType(), user.getIsActive());
        }

        // 4. Check if account is active (skip check for admin users)
        boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                         "super_admin".equalsIgnoreCase(user.getUserType());

        log.info("[GoogleLoginUseCase] isAdmin={}, userType={}, isActive={}", isAdmin, user.getUserType(), user.getIsActive());

        if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
            log.error("[GoogleLoginUseCase] ❌ Account BANNED — userId={}", user.getId());
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        // 5. Generate JWT access token
        log.info("[GoogleLoginUseCase] 🔑 Step 3: Generating JWT access token for userId={}...", user.getId());
        String accessToken = jwtProvider.generateAccessToken(
            user.getId(),
            user.getEmail().getValue(),
            user.getUserType()
        );
        log.info("[GoogleLoginUseCase] ✅ JWT access token generated (length={})", accessToken != null ? accessToken.length() : 0);

        // Refresh token được tạo và lưu bởi RefreshTokenService trong AuthController
        log.info("[GoogleLoginUseCase] 🎉 GoogleLoginUseCase.execute() COMPLETE — returning response");
        return new AuthResponseDTO(
            accessToken,
            null,
            user.getId(),
            user.getEmail().getValue(),
            user.getName(),
            user.getAvatarUrl(),
            user.getUserType()
        );
    }
}
    