package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import com.example.bankend_hovan_J2.infrastructure.oauth.GitHubTokenVerifier;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GitHubLoginUseCase {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubLoginUseCase.class);
    
    private final GitHubTokenVerifier gitHubTokenVerifier;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public GitHubLoginUseCase(GitHubTokenVerifier gitHubTokenVerifier,
                             UserRepository userRepository,
                             JwtProvider jwtProvider) {
        this.gitHubTokenVerifier = gitHubTokenVerifier;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    @Transactional
    public AuthResponseDTO execute(String code, String userType) {
        // Verify GitHub code and get user info
        GitHubTokenVerifier.GitHubUserInfo userInfo = gitHubTokenVerifier.verify(code);
        
        String githubId = userInfo.getId();
        String email = userInfo.getEmail();
        String name = userInfo.getName();
        String avatarUrl = userInfo.getAvatarUrl();

        // Find user by GitHub provider first
        User user = userRepository.findByProviderAndProviderId("github", githubId)
                .orElseGet(() -> {
                    // If not found, check if user exists with same email (from other provider)
                    return userRepository.findByEmail(new Email(email))
                        .map(existingUser -> {
                            // User exists with different provider, update to link GitHub
                            logger.info("User exists with email {}, linking GitHub account", email);
                            return existingUser;
                        })
                        .orElseGet(() -> {
                            // Create new user
                            User newUser = new User(
                                new Email(email),
                                name,
                                "github",
                                githubId,
                                userType
                            );
                            newUser.setAvatarUrl(avatarUrl);
                            return userRepository.save(newUser);
                        });
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
