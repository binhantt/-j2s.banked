# US-05: Thay đổi vai trò

## Mô tả ngắn
Cập nhật userType (vai trò) của tài khoản. Không kiểm tra group — có thể đổi từ user → backend và ngược lại.

## Endpoint
```
PUT /api/admin/users/{id}/update-role
```

## Request Body
```json
{
  "userType": "admin"
}
```

## Luồng xử lý

```
PUT /api/admin/users/{id}/update-role
→ userJpaRepository.findById(id)
→ not found → return 404
→ user.setUserType(newRole)
→ setUpdatedAt = LocalDateTime.now()
→ userJpaRepository.save(user)
→ return convertToResponse(user)
```

## Tác vụ
- [x] Cập nhật userType (role)
- [x] Cập nhật updatedAt
- [x] Trả về user đã cập nhật

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT endpoint đơn giản

### `references/`
- userType values: job_seeker, freelancer, hr, admin, super_admin, moderator, support
- Không chặn super_admin (chỉ toggle mới chặn)

## Ràng buộc
- Không validate userType mới hợp lệ hay không
- Không chặn super_admin đổi vai trò (khác với toggle status)
- Không tự động thay đổi group — group được tính dựa trên userType ở frontend
