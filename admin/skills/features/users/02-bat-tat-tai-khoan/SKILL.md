# SK-02: Bật / Tắt tài khoản

## Mô tả ngắn
Bật (activate) hoặc tắt (deactivate) tài khoản người dùng. Tài khoản bị khóa sẽ không thể đăng nhập. Super Admin bị khóa thao tác.

## Nguồn dữ liệu
- **Store:** `useUsersStore.setUserActive(id, isActive)`
- **API:**
  - Bật: `userApi.activateUser(id)` → `PUT /admin/users/{id}/activate`
  - Tắt: `userApi.deactivateUser(id)` → `PUT /admin/users/{id}/deactivate`

## Luồng chính

```
toggleActive(id, true) → activateUser(id) → PUT /admin/users/{id}/activate
toggleActive(id, false) → deactivateUser(id) → PUT /admin/users/{id}/deactivate
→ set() cập nhật users map → isActive = newValue
→ message.success / message.error
```

## Tác vụ
- [x] Toggle trạng thái bằng Switch trong bảng
- [x] Xác nhận bằng Popconfirm trước khi khóa (nút Khóa/Mở)
- [x] Cập nhật state tức thời trên UI
- [x] Chặn thao tác với `super_admin` (disabled)

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code gọi từ component: `toggleActive()`
- Đoạn code store: `setUserActive()`
- UI: Switch trong Table + Popconfirm

### `references/`
- API endpoints đầy đủ
- Hai endpoint riêng: activate vs deactivate
- Ràng buộc: super_admin disabled

## Ràng buộc
- **`super_admin`:** Switch + nút đều bị `disabled`
- Không có API `toggle` chung — phải gọi 2 endpoint riêng
