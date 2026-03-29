package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.User;
import com.example.bankend_hovan_J2.domain.user.entity.UserRefreshToken;
import com.example.bankend_hovan_J2.domain.user.repository.UserRefreshTokenRepository;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import com.example.bankend_hovan_J2.infrastructure.security.JwtProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final UserRefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    public RefreshTokenService(UserRefreshTokenRepository refreshTokenRepository,
                               JwtProvider jwtProvider,
                               UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
    }

    /**
     * Tạo và lưu refresh token mới cho user.
     * Token được lưu dưới dạng SHA-256 hash.
     */
    public String createRefreshToken(Long userId, String deviceInfo, String ipAddress) {
        String token = jwtProvider.generateRefreshToken(userId);
        String hash = hashToken(token);

        UserRefreshToken entity = new UserRefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(hash);
        entity.setDeviceInfo(deviceInfo);
        entity.setIpAddress(ipAddress);
        entity.setExpiresAt(Instant.now().plusSeconds(jwtProvider.getRefreshTokenExpirySeconds()));

        refreshTokenRepository.save(entity);
        return token;
    }

    /**
     * Kiểm tra refresh token mà KHÔNG rotate.
     * Dùng trong /api/auth/refresh endpoint để:
     * 1. Kiểm tra isActive của user TRƯỚC KHI rotate
     * 2. Trả 403 banned nếu tài khoản bị khóa
     * 3. Trả 401 nếu token đã dùng/hết hạn
     *
     * @throws RefreshTokenException  BANNED = tài khoản bị khóa (→ trả 403)
     * @throws RefreshTokenException  INVALID = token không hợp lệ (→ trả 401)
     * @throws RefreshTokenException  USED    = token đã dùng/revoke (→ trả 401)
     */
    public RefreshTokenValidationResult validateRefreshTokenOnly(String oldToken) {
        if (!jwtProvider.validateRefreshToken(oldToken)) {
            throw RefreshTokenException.invalid();
        }

        String hash = hashToken(oldToken);
        Optional<UserRefreshToken> existing = refreshTokenRepository.findByTokenHash(hash);

        if (existing.isEmpty()) {
            throw RefreshTokenException.used();
        }

        UserRefreshToken entity = existing.get();
        if (entity.isRevoked() || entity.isUsed()) {
            throw RefreshTokenException.used();
        }

        // ── Kiểm tra tài khoản có bị khóa không ──
        Long userId = jwtProvider.getUserIdFromToken(oldToken);
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                             "super_admin".equalsIgnoreCase(user.getUserType());
            if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
                throw RefreshTokenException.banned();
            }
        }

        return new RefreshTokenValidationResult(userId, entity);
    }

    /**
     * Refresh token rotation: revoke token cũ, tạo cặp token mới.
     * Token cũ chỉ dùng được 1 lần.
     *
     * @throws RuntimeException nếu token không hợp lệ hoặc đã được dùng/revoked
     */
    @Transactional
    public TokenPair rotateRefreshToken(String oldToken, String userEmail, String userType,
                                         String deviceInfo, String ipAddress) {
        if (!jwtProvider.validateRefreshToken(oldToken)) {
            throw new RuntimeException("Refresh token không hợp lệ");
        }

        String hash = hashToken(oldToken);
        Optional<UserRefreshToken> existing = refreshTokenRepository.findByTokenHash(hash);

        if (existing.isEmpty() || existing.get().isRevoked() || existing.get().isUsed()) {
            throw new RuntimeException("Refresh token đã được sử dụng hoặc đã bị thu hồi");
        }

        // Revoke token cũ — đánh dấu isUsed = true
        UserRefreshToken entity = existing.get();
        entity.setUsed(true);
        refreshTokenRepository.save(entity);

        // Tạo token mới
        Long userId = jwtProvider.getUserIdFromToken(oldToken);
        String newAccessToken = jwtProvider.generateAccessToken(userId, userEmail, userType);
        String newRefreshToken = createRefreshToken(userId, deviceInfo, ipAddress);

        return new TokenPair(newAccessToken, newRefreshToken);
    }

    /**
     * Revoke refresh token (logout).
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        if (token == null || token.isBlank()) return;
        String hash = hashToken(token);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(entity -> {
            entity.setRevoked(true);
            refreshTokenRepository.save(entity);
        });
    }

    /**
     * Revoke tất cả refresh tokens của một user.
     */
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.findByUserIdAndIsRevokedFalse(userId)
                .forEach(entity -> {
                    entity.setRevoked(true);
                    refreshTokenRepository.save(entity);
                });
    }

    /**
     * SHA-256 hash một token để lưu vào DB (không lưu plaintext).
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public record TokenPair(String accessToken, String refreshToken) {}

    /** Kết quả kiểm tra refresh token */
    public record RefreshTokenValidationResult(Long userId, UserRefreshToken entity) {}

    /** Exception riêng để phân biệt từng loại lỗi refresh token */
    public static class RefreshTokenException extends RuntimeException {
        private final RefreshTokenErrorType type;
        public enum RefreshTokenErrorType { INVALID, USED, BANNED }

        private RefreshTokenException(String message, RefreshTokenErrorType type) {
            super(message);
            this.type = type;
        }

        public RefreshTokenErrorType getType() { return type; }
        public boolean isBanned() { return type == RefreshTokenErrorType.BANNED; }

        public static RefreshTokenException invalid() {
            return new RefreshTokenException("Refresh token không hợp lệ hoặc đã hết hạn", RefreshTokenErrorType.INVALID);
        }
        public static RefreshTokenException used() {
            return new RefreshTokenException("Refresh token đã được sử dụng hoặc đã bị thu hồi", RefreshTokenErrorType.USED);
        }
        public static RefreshTokenException banned() {
            return new RefreshTokenException("Tài khoản của bạn đã bị khóa", RefreshTokenErrorType.BANNED);
        }
    }

    /**
     * Tìm refresh token entity theo hash — dùng để kiểm tra trạng thái
     * trước khi rotate (trong AuthController.refreshToken)
     */
    public Optional<UserRefreshToken> findByTokenHash(String hash) {
        return refreshTokenRepository.findByTokenHash(hash);
    }

    /** SHA-256 hash — public để AuthController có thể dùng khi cần */
    public String hashTokenForRefresh(String token) {
        return hashToken(token);
    }
}
