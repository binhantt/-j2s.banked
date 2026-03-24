# US-03: Tạo tài khoản Backend

## Mô tả ngắn
Tạo tài khoản backend mới (admin, super_admin, moderator, support). Mã hóa password trước khi lưu.

## Endpoint
```
POST /api/admin/users/create
```

## Request Body
```json
{
  "email": "admin@company.vn",
  "name": "Admin Name",
  "password": "123456",
  "userType": "admin"
}
```

## Luồng xử lý

```
POST /api/admin/users/create
→ Validate email chưa tồn tại: userJpaRepository.findByEmail(email)
→ Tồn tại → return 400 error
→ Tạo UserEntityJpa mới
→ setEmail, setName, setProvider("local"), setProviderId(email)
→ setUserType, setIsActive(true)
→ setEncryptedPassword: aesGcmCryptoService.encrypt(password)
→ setCreatedAt, setUpdatedAt = LocalDateTime.now()
→ userJpaRepository.save(newUser)
→ return convertToResponse(newUser)
```

## Tác vụ
- [x] Validate email chưa tồn tại
- [x] Mã hóa password bằng AES-GCM trước khi lưu
- [x] Set provider = "local" (không phải OAuth)
- [x] Set isActive = true mặc định
- [x] Trả về user vừa tạo

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: POST /api/admin/users/create
- Encrypt password: `aesGcmCryptoService.encrypt(password)`
- Check email exists: `userJpaRepository.findByEmail(email)`

### `references/`
- Service: AesGcmCryptoService
- Entity: UserEntityJpa
- userType values: admin, super_admin, moderator, support

## Ràng buộc
- Email phải là duy nhất trong hệ thống
- Password được mã hóa AES-GCM trước khi lưu DB
- userType chỉ nhận: admin, super_admin, moderator, support
