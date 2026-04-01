package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import com.example.bankend_hovan_J2.infrastructure.security.AesGcmCryptoService;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import org.springframework.stereotype.Service;

@Service
public class PasswordLoginUseCase {
    private final UserRepository userRepository;
    private final AesGcmCryptoService aesGcmCryptoService;
    private final JwtProvider jwtProvider;

    public PasswordLoginUseCase(UserRepository userRepository,
                                AesGcmCryptoService aesGcmCryptoService,
                                JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.aesGcmCryptoService = aesGcmCryptoService;
        this.jwtProvider = jwtProvider;
    }

    public AuthResponseDTO execute(String email, String password) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

        // Check if account is active
        // Chỉ super_admin được bypass — admin bình thường vẫn bị banned được
        boolean isSuperAdmin = "super_admin".equalsIgnoreCase(user.getUserType());

        if (!isSuperAdmin && user.getIsActive() != null && !user.getIsActive()) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        if (user.getEncryptedPassword() == null || user.getEncryptedPassword().isBlank()) {
            throw new RuntimeException("Tài khoản chưa được thiết lập mật khẩu");
        }

        String plainPassword = aesGcmCryptoService.decrypt(user.getEncryptedPassword());
        if (!plainPassword.equals(password)) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        String accessToken = jwtProvider.generateAccessToken(
                user.getId(),
                user.getEmail().getValue(),
                user.getUserType()
        );

        // Refresh token được tạo và lưu bởi RefreshTokenService trong AuthController
        return new AuthResponseDTO(
                accessToken,
                null, // refreshToken — sẽ được set bởi AuthController sau khi lưu vào DB
                user.getId(),
                user.getEmail().getValue(),
                user.getName(),
                user.getAvatarUrl(),
                user.getUserType()
        );
    }
}


