package com.example.bankend_hovan_J2.presentation.admin;

import com.example.bankend_hovan_J2.application.auth.AuthResponseDTO;
import com.example.bankend_hovan_J2.application.auth.RefreshTokenService;
import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.user.UserJpaRepository;
import com.example.bankend_hovan_J2.infrastructure.security.AesGcmCryptoService;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Public controller để tạo tài khoản admin và đăng nhập admin.
 * KHÔNG yêu cầu auth token.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class AdminAccountController {

    private final UserJpaRepository userJpaRepository;
    private final AesGcmCryptoService aesGcmCryptoService;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * POST /api/admin/register
     * Tạo tài khoản admin mới (public endpoint — không cần auth).
     *
     * Body JSON:
     * {
     *   "email": "admin@company.com",
     *   "name": "Admin Name",
     *   "password": "yourpassword"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerAdmin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            String password = request.get("password");

            // Validate input
            if (email == null || email.isBlank()) {
                return badRequest("Email là bắt buộc");
            }
            if (name == null || name.isBlank()) {
                return badRequest("Tên là bắt buộc");
            }
            if (password == null || password.length() < 4) {
                return badRequest("Mật khẩu phải có ít nhất 4 ký tự");
            }

            // Check email đã tồn tại chưa
            if (userJpaRepository.findByEmail(email).isPresent()) {
                return badRequest("Email đã tồn tại trong hệ thống");
            }

            // Tạo tài khoản admin
            UserEntityJpa admin = new UserEntityJpa();
            admin.setEmail(email);
            admin.setName(name);
            admin.setProvider("local");
            admin.setProviderId(email);
            admin.setUserType("admin");
            admin.setIsActive(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setEncryptedPassword(aesGcmCryptoService.encrypt(password));

            userJpaRepository.save(admin);

            log.info("✅ Created new admin account: {}", email);

            Map<String, Object> response = new HashMap<>();
            response.put("id", admin.getId());
            response.put("email", admin.getEmail());
            response.put("name", admin.getName());
            response.put("userType", admin.getUserType());
            response.put("message", "Tạo tài khoản admin thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating admin account", e);
            return serverError("Không thể tạo tài khoản admin: " + e.getMessage());
        }
    }

    /**
     * POST /api/admin/login
     * Đăng nhập admin bằng email + password.
     *
     * Body JSON:
     * {
     *   "email": "admin@company.com",
     *   "password": "yourpassword"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> request,
                                        HttpServletRequest httpRequest) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return badRequest("Email và mật khẩu là bắt buộc");
            }

            // Tìm user
            UserEntityJpa user = userJpaRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

            // Chỉ cho phép userType = admin hoặc super_admin
            if (!"admin".equalsIgnoreCase(user.getUserType()) &&
                !"super_admin".equalsIgnoreCase(user.getUserType())) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Tài khoản này không có quyền truy cập admin"));
            }

            // Kiểm tra tài khoản bị khóa
            boolean isSuperAdmin = "super_admin".equalsIgnoreCase(user.getUserType());
            if (!isSuperAdmin && user.getIsActive() != null && !user.getIsActive()) {
                return ResponseEntity.status(403)
                        .body(Map.of("banned", true, "message", "Tài khoản của bạn đã bị khóa"));
            }

            // Kiểm tra mật khẩu
            if (user.getEncryptedPassword() == null || user.getEncryptedPassword().isBlank()) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Tài khoản chưa được thiết lập mật khẩu"));
            }

            String plainPassword = aesGcmCryptoService.decrypt(user.getEncryptedPassword());
            if (!plainPassword.equals(password)) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Email hoặc mật khẩu không đúng"));
            }

            // Tạo JWT access token
            String accessToken = jwtProvider.generateAccessToken(
                    user.getId(),
                    user.getEmail(),
                    user.getUserType()
            );

            // Lưu refresh token
            String deviceInfo = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIP(httpRequest);
            String refreshToken = refreshTokenService.createRefreshToken(
                    user.getId(), deviceInfo, ipAddress);

            log.info("✅ Admin login success: {} ({})", email, user.getUserType());

            AuthResponseDTO response = new AuthResponseDTO(
                    accessToken,
                    refreshToken,
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getAvatarUrl(),
                    user.getUserType()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error during admin login", e);
            return serverError("Lỗi đăng nhập: " + e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.badRequest().body(body);
    }

    private ResponseEntity<Map<String, Object>> serverError(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.internalServerError().body(body);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        return (xfHeader == null || xfHeader.isBlank())
                ? request.getRemoteAddr()
                : xfHeader.split(",")[0];
    }
}
