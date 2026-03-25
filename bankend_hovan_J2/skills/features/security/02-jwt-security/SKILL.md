# SC-02: JWT Security Hardening

## Mô tả ngắn
Thêm Refresh Token Rotation và Token Blacklist để chống replay attack và token theft. Mỗi lần refresh đều sinh refresh token mới, revoke token cũ.

## Endpoint (mới)
```
POST /api/auth/refresh        — Refresh access token (có refresh token cũ)
POST /api/auth/logout         — Logout: revoke refresh token, add access token vào blacklist
```

## Luồng xử lý

```
Login:
  User → POST /api/auth/login
  → Tạo access token (short-lived: 1 ngày)
  → Tạo refresh token (long-lived: 7 ngày)
  → Lưu refresh token hash vào DB (user_device_tokens)
  → Trả về cả 2 token

Refresh:
  User → POST /api/auth/refresh (gửi access + refresh token)
  → Validate refresh token
  → Revoke refresh token cũ (đánh dấu used=true)
  → Tạo access token mới
  → Tạo refresh token mới
  → Trả về token mới

Logout:
  User → POST /api/auth/logout
  → Add access token JTI vào blacklist (Redis/blacklist set)
  → Revoke refresh token
  → 200 OK
```

## Tác vụ
- [x] Tạo bảng/entity `UserRefreshToken` — lưu refresh token hash + device info + used flag
- [x] Tạo `TokenBlacklistService` — lưu JTI vào Redis/Map với TTL = token expiry
- [x] Cập nhật `JwtProvider` — hỗ trợ JTI, refresh token validation, blacklist check
- [x] Thêm endpoint `/api/auth/refresh`
- [x] Thêm endpoint `/api/auth/logout`
- [x] Cập nhật `JwtAuthenticationFilter` — kiểm tra blacklist trước khi xử lý

## Cách sử dụng code trong thư mục

### `scripts/`
- Entity: `UserRefreshToken` (lưu refresh token)
- Service: `TokenBlacklistService`, `RefreshTokenService`
- Controller: thêm endpoint refresh/logout
- Filter: cập nhật `JwtAuthenticationFilter`

### `references/`
- JWT config properties

## Ràng buộc
- Refresh token chỉ dùng được **1 lần** (rotation)
- Blacklist access token: lưu JTI với TTL = expiry còn lại
- Refresh token expiry: 7 ngày
- Access token expiry: 1 ngày (giảm từ hiện tại nếu > 1 ngày)
