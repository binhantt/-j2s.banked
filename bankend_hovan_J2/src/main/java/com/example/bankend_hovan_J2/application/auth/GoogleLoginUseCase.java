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

        // Generate JWT tokens
        String accessToken = jwtProvider.generateAccessToken(
            user.getId(), 
            user.getEmail().getValue(),
            user.getUserType()
        );
        
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        return new AuthResponseDTO(
            accessToken,
            refreshToken,
            user.getId(),
            user.getEmail().getValue(),
            user.getName(),
            user.getAvatarUrl(),
            user.getUserType()
        );
    }
}
    