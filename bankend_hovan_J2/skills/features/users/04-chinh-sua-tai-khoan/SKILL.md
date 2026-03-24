# US-04: Chỉnh sửa tài khoản

## Mô tả ngắn
Cập nhật email và/hoặc password của tài khoản. Email mới phải chưa tồn tại. Password được mã hóa trước khi lưu.

## Endpoint
```
PUT /api/admin/users/{id}/update-credentials
```

## Request Body
```json
{
  "email": "newemail@company.vn",
  "password": "newpassword"
}
```
> Cả 2 field đều optional. Để trống = giữ nguyên.

## Luồng xử lý

```
PUT /api/admin/users/{id}/update-credentials
→ userJpaRepository.findById(id)
→ not found → return 404

→ newEmail != null && newEmail != currentEmail?
  → userJpaRepository.findByEmail(newEmail) tồn tại?
    → return 400 error "Email đã tồn tại"
  → setEmail(newEmail)

→ newPassword != null && not blank?
  → setEncryptedPassword: aesGcmCryptoService.encrypt(newPassword)

→ setUpdatedAt = LocalDateTime.now()
→ userJpaRepository.save(user)
→ return convertToResponse(user)
```

## Tác vụ
- [x] Cập nhật email (validate không trùng)
- [x] Cập nhật password (mã hóa AES-GCM)
- [x] Không gửi = giữ nguyên giá trị cũ
- [x] Cập nhật updatedAt

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT endpoint
- Check email unique
- Encrypt password

### `references/`
- Service: AesGcmCryptoService
- Body: `{ email?, password? }`

## Ràng buộc
- Email mới phải unique
- Password được mã hóa trước khi lưu
- Không nhận field nào → giữ nguyên
