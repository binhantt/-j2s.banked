package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import com.example.bankend_hovan_J2.infrastructure.oauth.FacebookTokenVerifier;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FacebookLoginUseCase {
    
    private static final Logger logger = LoggerFactory.getLogger(FacebookLoginUseCase.class);
    
    private final FacebookTokenVerifier facebookTokenVerifier;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public FacebookLoginUseCase(FacebookTokenVerifier facebookTokenVerifier,
                               UserRepository userRepository,
                               JwtProvider jwtProvider) {
        this.facebookTokenVerifier = facebookTokenVerifier;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    @Transactional
    public AuthResponseDTO execute(String accessToken, String userType) {
        FacebookTokenVerifier.FacebookUserInfo userInfo = facebookTokenVerifier.verify(accessToken);
        
        String facebookId = userInfo.getId();
        String email = userInfo.getEmail();
        String name = userInfo.getName();
        String avatarUrl = userInfo.getAvatarUrl();

        // Find user by Facebook provider first
        User user = userRepository.findByProviderAndProviderId("facebook", facebookId)
                .orElseGet(() -> {
                    // Check if user exists with same email
                    return userRepository.findByEmail(new Email(email))
                        .map(existingUser -> {
                            logger.info("User exists with email {}, linking Facebook account", email);
                            return existingUser;
                        })
                        .orElseGet(() -> {
                            // Create new user
                            User newUser = new User(
                                new Email(email),
                                name,
                                "facebook",
                                facebookId,
                                userType
                            );
                            newUser.setAvatarUrl(avatarUrl);
                            return userRepository.save(newUser);
                        });
                });

        String jwtAccessToken = jwtProvider.generateAccessToken(
            user.getId(), 
            user.getEmail().getValue(),
            user.getUserType()
        );
        
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        return new AuthResponseDTO(
            jwtAccessToken,
            refreshToken,
            user.getId(),
            user.getEmail().getValue(),
            user.getName(),
            user.getAvatarUrl(),
            user.getUserType()
        );
    }
}
