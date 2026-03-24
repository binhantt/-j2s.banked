# US-02: Bật / Tắt tài khoản

## Mô tả ngắn
Bật (activate) hoặc tắt (deactivate) tài khoản người dùng. Super Admin bị chặn không cho khóa.

## Endpoints

| Hành động | Method | Endpoint |
|-----------|--------|----------|
| Toggle | PUT | `/api/admin/users/{id}/toggle-status` |
| Kích hoạt | PUT | `/api/admin/users/{id}/activate` |
| Vô hiệu hóa | PUT | `/api/admin/users/{id}/deactivate` |

## Luồng xử lý

```
toggle: userJpaRepository.findById(id)
  → findById → Optional
  → super_admin? → return 400 error
  → toggle isActive (!current)
  → userJpaRepository.save(user)
  → return { id, isActive, message }

activate: setIsActive(true) → save()
deactivate: setIsActive(false) → save()
```

## Tác vụ
- [x] Toggle trạng thái (1 endpoint chung)
- [x] Kích hoạt riêng (1 endpoint)
- [x] Vô hiệu hóa riêng (1 endpoint)
- [x] Chặn super_admin không cho khóa

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: 3 endpoint toggle/activate/deactivate
- Logic check super_admin
- Response body: `{ id, isActive, message }`

### `references/`
- Entity: UserEntityJpa
- Fields: isActive, userType

## Ràng buộc
- **super_admin:** Nếu userType = "super_admin" → return 400 với message "Không thể khóa tài khoản Super Admin"
- toggle endpoint không nhận body → đọc trạng thái hiện tại rồi đảo ngược
