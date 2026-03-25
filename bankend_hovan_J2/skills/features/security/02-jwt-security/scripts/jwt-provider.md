# JWT Provider — Hỗ trợ Refresh Token + Blacklist + JTI

## Cập nhật `JwtProvider.java`

```java
// src/main/java/.../infrastructure/security/JwtProvider.java

package com.example.bankend_hovan_J2.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtProvider {

    private final SecretKey key;
    private final long accessTokenExpiry;  // ms
    private final long refreshTokenExpiry; // ms

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long accessTokenExpiry,
            @Value("${jwt.refresh-expiration:604800000}") long refreshTokenExpiry) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }

    // --- Access Token ---
    public String generateAccessToken(Long userId, String userType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiry);
        return Jwts.builder()
                .id(UUID.randomUUID().toString())          // JTI
                .subject(userId.toString())
                .claim("userType", userType)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        return Long.parseLong(claims.getSubject());
    }

    public String getJtiFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        return claims.getId();
    }

    public Date getExpirationFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        return claims.getExpiration();
    }

    // --- Refresh Token ---
    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiry);
        return Jwts.builder()
                .id(UUID.randomUUID().toString())           // JTI
                .subject(userId.toString())
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload();
            return "refresh".equals(claims.get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getRefreshTokenExpirySeconds() {
        return refreshTokenExpiry / 1000;
    }
}
```
