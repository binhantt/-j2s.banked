# application.yml — JWT Security Properties

## Cập nhật `jwt:` section trong `application.yml`

```yaml
jwt:
  secret: hovan_google_login_system_super_secure_jwt_secret_key_2026_512bits_minimum_length_token_auth
  expiration: 86400000          # Access token: 1 ngày (ms) — giảm từ giá trị cũ nếu > 1 ngày
  refresh-expiration: 604800000  # Refresh token: 7 ngày (ms)
```

## Repository cho RefreshToken

```java
// src/main/java/.../domain/user/repository/UserRefreshTokenRepository.java

package com.example.bankend_hovan_J2.domain.user.repository;

import com.example.bankend_hovan_J2.domain.user.entity.UserRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRefreshTokenRepository extends JpaRepository<UserRefreshToken, Long> {
    Optional<UserRefreshToken> findByTokenHash(String tokenHash);
    List<UserRefreshToken> findByUserId(Long userId);
    List<UserRefreshToken> findByUserIdAndIsRevokedFalse(Long userId);
}
```

## Migration SQL (nếu dùng Flyway)

```sql
-- src/main/resources/db/migration/V008__Create_user_refresh_tokens.sql

CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Tổng kết Security Hardening

| Thành phần | Trước | Sau |
|-------------|-------|-----|
| Access token expiry | 1 ngày | 1 ngày |
| Refresh token | Không có | 7 ngày, rotation 1 lần |
| Token revocation | Không có | Blacklist JTI (Redis/Map) |
| Token rotation | Không có | Refresh = sinh token mới, revoke cũ |
| Blacklist check | Không có | JwtAuthenticationFilter check JTI |
