# SK-03: Tạo tài khoản Backend

## Mô tả ngắn
Tạo tài khoản vận hành backend mới (admin, super_admin, moderator, support). Chỉ hiển thị modal khi đang ở tab "Backend". Không tạo được tài khoản User.

## Nguồn dữ liệu
- **Store:** `useUsersStore.createBackendUser(data)`
- **API:** `userApi.createBackendUser(data)` → `POST /admin/users/create`

## Luồng chính

```
Nhấn "Tạo tài khoản Backend"
→ setCreateModalVisible(true)

handleCreateUser()
→ createForm.validateFields()
→ createBackendUser({ name, email, password, userType })
→ POST /admin/users/create
→ Store: thêm userRow vào mảng users
→ resetFields() + setCreateModalVisible(false)
→ message.success('Tạo tài khoản thành công')
```

## Tác vụ
- [x] Mở modal (chỉ khi `groupFilter === 'backend'`)
- [x] Nhập: tên, email, mật khẩu, vai trò
- [x] Validate dữ liệu phía client
- [x] Gọi API tạo + cập nhật danh sách
- [x] Reset form + đóng modal

## Fields bắt buộc

| Field | Validate |
|-------|----------|
| `name` | Required |
| `email` | Required + format email |
| `password` | Required + min 6 ký tự |
| `userType` | Required (chọn 1 trong 4 vai trò backend) |

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code component: `handleCreateUser()` + Modal
- Đoạn code store: `createBackendUser()`
- Options vai trò backend

### `references/`
- API endpoint: POST /admin/users/create
- Payload: `{ name, email, password, userType }`
- Roles: admin, super_admin, moderator, support

## Ràng buộc
- Chỉ tạo tài khoản **Backend**, không tạo User
- Modal chỉ hiện khi `groupFilter === 'backend'`
