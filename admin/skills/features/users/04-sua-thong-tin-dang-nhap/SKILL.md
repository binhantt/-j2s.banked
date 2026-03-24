# SK-04: Sửa thông tin đăng nhập

## Mô tả ngắn
Chỉnh sửa email và/hoặc mật khẩu của tài khoản. Kích hoạt qua nút "Sửa TK". Email hiện tại điền sẵn trong form. Để trống password = giữ nguyên.

## Nguồn dữ liệu
- **Store:** `useUsersStore.updateUserCredentials(id, data)`
- **API:** `userApi.updateUserCredentials(id, data)` → `PUT /admin/users/{id}/update-credentials`

## Luồng chính

```
Nhấn "Sửa TK" (record)
→ openEditModal(record) → setFieldsValue(email) + setEditModalVisible(true)

handleEditCredentials()
→ editForm.validateFields()
→ updateUserCredentials(selectedUser.id, { email, password })
→ PUT /admin/users/{id}/update-credentials
→ Store: thay thế user trong mảng
→ resetFields() + setEditModalVisible(false)
```

## Tác vụ
- [x] Mở modal với email hiện tại điền sẵn
- [x] Cho sửa email mới và/hoặc password mới
- [x] Validate: email format, password min 6 ký tự
- [x] Gọi API cập nhật
- [x] Reset form + đóng modal

## Fields (đều optional)

| Field | Validate |
|-------|----------|
| `email` | Format email (nếu có) |
| `password` | Min 6 ký tự (nếu có), để trống = giữ nguyên |

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `openEditModal()` + `handleEditCredentials()`
- Modal code đầy đủ

### `references/`
- API endpoint: PUT /admin/users/{id}/update-credentials
- Payload: `{ email?: string, password?: string }`

## Ràng buộc
- Cả 2 field đều **optional**
- Placeholder password: "Để trống nếu không đổi"
