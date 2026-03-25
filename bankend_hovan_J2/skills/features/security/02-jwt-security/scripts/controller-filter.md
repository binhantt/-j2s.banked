# Controller — Refresh + Logout + Filter Update

## Thêm vào `AuthController.java`

```java
// POST /api/auth/refresh
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request,
                                       HttpServletRequest httpRequest) {
    try {
        String oldRefreshToken = request.getRefreshToken();

        // Validate refresh token signature + expiry
        if (!jwtProvider.validateRefreshToken(oldRefreshToken)) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Refresh token không hợp lệ hoặc đã hết hạn"
            ));
        }

        // Lấy user từ token
        Long userId = jwtProvider.getUserIdFromToken(oldRefreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ╔══════════════════════════════════════════════════════════════╗
        // ║  BẮT BUỘC: Check isActive TRƯỚC KHI rotate token     ║
        // ║  Admin khóa tài khoản → trả 403 + banned=true          ║
        // ║  → Frontend interceptor bắt 403 → handleLogout()       ║
        // ║  → User tự động bị đẩy ra /login                     ║
        // ╚══════════════════════════════════════════════════════════════╝
        boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                         "super_admin".equalsIgnoreCase(user.getUserType());
        if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
            return ResponseEntity.status(403)
                .body(Map.of(
                    "banned", true,
                    "message", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
                ));
        }

        // Kiểm tra refresh token CHƯA bị revoke/used
        String hash = refreshTokenService.hashTokenForRefresh(oldRefreshToken);
        var existingToken = refreshTokenService.findByTokenHash(hash);
        if (existingToken.isEmpty() || existingToken.get().isRevoked() || existingToken.get().isUsed()) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            ));
        }

        String deviceInfo = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIP(httpRequest);

        // Rotation: revoke old token, create new pair
        RefreshTokenService.TokenPair tokens = refreshTokenService.rotateRefreshToken(
            oldRefreshToken,
            user.getEmail().getValue(),
            user.getUserType(),
            deviceInfo,
            ipAddress
        );

        return ResponseEntity.ok(new AuthResponseDTO(
            tokens.accessToken(),
            tokens.refreshToken(),
            user.getId(),
            user.getEmail().getValue(),
            user.getName(),
            user.getAvatarUrl(),
            user.getUserType()
        ));
    } catch (RuntimeException e) {
        return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
    }
}

// POST /api/auth/logout
@PostMapping("/logout")
public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request,
                                 HttpServletRequest httpRequest) {
    String authHeader = httpRequest.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String accessToken = authHeader.substring(7);
        String jti = jwtProvider.getJtiFromToken(accessToken);
        Date expiry = jwtProvider.getExpirationFromToken(accessToken);
        tokenBlacklistService.blacklistToken(jti, expiry.getTime() / 1000);
    }
    refreshTokenService.revokeRefreshToken(request.getRefreshToken());
    return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
}

private String getClientIP(HttpServletRequest request) {
    String xfHeader = request.getHeader("X-Forwarded-For");
    return (xfHeader == null) ? request.getRemoteAddr() : xfHeader.split(",")[0];
}
```

## RefreshTokenService — Thêm helper methods

```java
// Trong RefreshTokenService.java, thêm các method sau:

/** Tìm refresh token entity theo hash — dùng để kiểm tra trước khi rotate */
public Optional<UserRefreshToken> findByTokenHash(String hash) {
    return refreshTokenRepository.findByTokenHash(hash);
}

/** SHA-256 hash — public để AuthController có thể dùng */
public String hashTokenForRefresh(String token) {
    return hashToken(token);  // gọi method private có sẵn
}

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
```

## RefreshTokenRequest DTO

```java
// src/main/java/.../presentation/auth/RefreshTokenRequest.java

package com.example.bankend_hovan_J2.presentation.auth;

public class RefreshTokenRequest {
    private String refreshToken;

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
```

## Cập nhật `JwtAuthenticationFilter.java`

Thêm blacklist check + isActive check:

```java
// Trong doFilterInternal, sau dòng:
// if (!jwtProvider.validateToken(token)) { ... }

try {
    // ── JTI blacklist check ──
    String jti = jwtProvider.getJtiFromToken(token);
    if (tokenBlacklistService != null && tokenBlacklistService.isBlacklisted(jti)) {
        filterChain.doFilter(request, response);
        return;
    }

    Long userId = jwtProvider.getUserIdFromToken(token);
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
        filterChain.doFilter(request, response);
        return;
    }

    // ── Check account isActive (không check cho admin) ──
    boolean isAdmin = "admin".equalsIgnoreCase(user.getUserType()) ||
                     "super_admin".equalsIgnoreCase(user.getUserType());
    if (!isAdmin && user.getIsActive() != null && !user.getIsActive()) {
        // Trả 403 + banned=true → Frontend interceptor bắt → handleLogout()
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
            "{\"banned\":true,\"message\":\"Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.\"}"
        );
        return;
    }

    // Set authentication context
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
            user.getId(), null,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getUserType().toUpperCase()))
        );
    SecurityContextHolder.getContext().setAuthentication(authentication);
    filterChain.doFilter(request, response);

} catch (Exception e) {
    filterChain.doFilter(request, response);
}
```

> **Lưu ý:** Inject `TokenBlacklistService` vào constructor của `JwtAuthenticationFilter`.
> Trường hợp `tokenBlacklistService == null` (Redis unavailable) → cho phép qua để tránh crash.
