package com.example.bankend_hovan_J2.presentation.auth;

import com.example.bankend_hovan_J2.application.auth.AuthResponseDTO;
import com.example.bankend_hovan_J2.application.auth.FacebookLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.GitHubLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.GoogleLoginUseCase;
import com.example.bankend_hovan_J2.application.auth.PasswordLoginUseCase;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final GoogleLoginUseCase googleLoginUseCase;
    private final GitHubLoginUseCase gitHubLoginUseCase;
    private final FacebookLoginUseCase facebookLoginUseCase;
    private final PasswordLoginUseCase passwordLoginUseCase;
    private final JwtProvider jwtProvider;
    private final com.example.bankend_hovan_J2.domain.user.repository.UserRepository userRepository;

    public AuthController(GoogleLoginUseCase googleLoginUseCase,
                          GitHubLoginUseCase gitHubLoginUseCase,
                          FacebookLoginUseCase facebookLoginUseCase,
                          PasswordLoginUseCase passwordLoginUseCase,
                          JwtProvider jwtProvider,
                          com.example.bankend_hovan_J2.domain.user.repository.UserRepository userRepository) {
        this.googleLoginUseCase = googleLoginUseCase;
        this.gitHubLoginUseCase = gitHubLoginUseCase;
        this.facebookLoginUseCase = facebookLoginUseCase;
        this.passwordLoginUseCase = passwordLoginUseCase;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth API is working!");
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody GoogleLoginRequest request) {
        AuthResponseDTO response = googleLoginUseCase.execute(
                request.getIdToken(),
                request.getUserType()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/github")
    public ResponseEntity<AuthResponseDTO> githubLogin(@RequestBody GitHubLoginRequest request) {
        AuthResponseDTO response = gitHubLoginUseCase.execute(
                request.getCode(),
                request.getUserType()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/facebook")
    public ResponseEntity<AuthResponseDTO> facebookLogin(@RequestBody FacebookLoginRequest request) {
        AuthResponseDTO response = facebookLoginUseCase.execute(
                request.getAccessToken(),
                request.getUserType()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginByPassword(@RequestBody PasswordLoginRequest request) {
        try {
            AuthResponseDTO response = passwordLoginUseCase.execute(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();

            if (!jwtProvider.validateToken(refreshToken)) {
                return ResponseEntity.status(401).build();
            }

            Long userId = jwtProvider.getUserIdFromToken(refreshToken);

            com.example.bankend_hovan_J2.domain.user.entity.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newAccessToken = jwtProvider.generateAccessToken(
                    user.getId(),
                    user.getEmail().getValue(),
                    user.getUserType()
            );

            String newRefreshToken = jwtProvider.generateRefreshToken(user.getId());

            return ResponseEntity.ok(new AuthResponseDTO(
                    newAccessToken,
                    newRefreshToken,
                    user.getId(),
                    user.getEmail().getValue(),
                    user.getName(),
                    user.getAvatarUrl(),
                    user.getUserType()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
