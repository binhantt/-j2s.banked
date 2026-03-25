# Token Services — Blacklist + Refresh Token

## TokenBlacklistService

Dùng Redis (từ cấu hình có sẵn trong `application.yml`) hoặc fallback ConcurrentHashMap.

```java
// src/main/java/.../infrastructure/security/TokenBlacklistService.java

package com.example.bankend_hovan_J2.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;

    // Fallback nếu Redis không available
    private final Set<String> inMemoryBlacklist = ConcurrentHashMap.newKeySet();

    public TokenBlacklistService(StringRedisTemplate redisTemplate,
                                  @Value("${spring.data.redis.host:localhost}") String redisHost) {
        this.redisTemplate = redisTemplate;
        this.redisEnabled = !"localhost".equals(redisHost);
    }

    /**
     * Thêm JTI vào blacklist với TTL = thời gian còn lại của token
     */
    public void blacklistToken(String jti, long expiryTimestampSeconds) {
        long ttlSeconds = expiryTimestampSeconds - (System.currentTimeMillis() / 1000);
        if (ttlSeconds <= 0) return; // Token đã hết hạn

        if (redisEnabled) {
            redisTemplate.opsForValue().set("blacklist:" + jti, "1", Duration.ofSeconds(ttlSeconds));
        } else {
            inMemoryBlacklist.add(jti);
        }
    }

    public boolean isBlacklisted(String jti) {
        if (redisEnabled) {
            return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + jti));
        } else {
            return inMemoryBlacklist.contains(jti);
        }
    }

    public void removeFromBlacklist(String jti) {
        if (redisEnabled) {
            redisTemplate.delete("blacklist:" + jti);
        } else {
            inMemoryBlacklist.remove(jti);
        }
    }
}
```

## UserRefreshToken Entity

```java
// src/main/java/.../domain/user/entity/UserRefreshToken.java

package com.example.bankend_hovan_J2.domain.user.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_refresh_tokens")
public class UserRefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash; // SHA-256 hash của refresh token

    @Column(name = "device_info")
    private String deviceInfo; // User-Agent

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "is_revoked", nullable = false)
    private boolean isRevoked = false;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public boolean isRevoked() { return isRevoked; }
    public void setRevoked(boolean revoked) { isRevoked = revoked; }
    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
```

## RefreshTokenService

```java
// src/main/java/.../application/auth/RefreshTokenService.java

package com.example.bankend_hovan_J2.application.auth;

import com.example.bankend_hovan_J2.domain.user.entity.UserRefreshToken;
import com.example.bankend_hovan_J2.domain.user.repository.UserRefreshTokenRepository;
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

    public RefreshTokenService(UserRefreshTokenRepository refreshTokenRepository,
                                JwtProvider jwtProvider) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProvider = jwtProvider;
    }

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

    @Transactional
    public TokenPair rotateRefreshToken(String oldToken, String deviceInfo, String ipAddress) {
        if (!jwtProvider.validateRefreshToken(oldToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String hash = hashToken(oldToken);
        Optional<UserRefreshToken> existing = refreshTokenRepository.findByTokenHash(hash);

        if (existing.isEmpty() || existing.get().isRevoked() || existing.get().isUsed()) {
            throw new RuntimeException("Refresh token already used or revoked");
        }

        // Revoke old token
        UserRefreshToken entity = existing.get();
        entity.setUsed(true);
        refreshTokenRepository.save(entity);

        // Create new tokens
        Long userId = jwtProvider.getUserIdFromToken(oldToken);
        String newAccessToken = jwtProvider.generateAccessToken(userId,
            refreshTokenRepository.findByUserId(userId).stream()
                .findFirst().orElseThrow().getUserId() > 0 ? "user" : "user");
        String newRefreshToken = createRefreshToken(userId, deviceInfo, ipAddress);

        return new TokenPair(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void revokeRefreshToken(String token) {
        String hash = hashToken(token);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(entity -> {
            entity.setRevoked(true);
            refreshTokenRepository.save(entity);
        });
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    public record TokenPair(String accessToken, String refreshToken) {}
}
```
