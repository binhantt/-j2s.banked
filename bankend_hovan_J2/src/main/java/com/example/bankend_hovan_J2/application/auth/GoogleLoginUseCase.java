package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import com.example.bankend_hovan_J2.infrastructure.oauth.GoogleTokenVerifier;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoogleLoginUseCase {
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
        // Verify Google token
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);
        
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String avatarUrl = (String) payload.get("picture");

        // Find or create user
        User user = userRepository.findByProviderAndProviderId("google", googleId)
                .orElseGet(() -> {
                    // Create new user
                    User newUser = new User(
                        new Email(email),
                        name,
                        "google",
                        googleId,
                        userType
                    );
                    newUser.setAvatarUrl(avatarUrl);
                    return userRepository.save(newUser);
                });

        // Check if account is active (skip check for admin users)
        boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) || 
                         "super_admin".equalsIgnoreCase(user.getUserType());
        
        if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        // Generate JWT toke
        String accessToken = jwtProvider.generateAccessToken(
            user.getId(),
            user.getEmail().getValue(),
            user.getUserType()
        );

        // Refresh token được tạo và lưu bởi RefreshTokenService trong AuthController
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
    