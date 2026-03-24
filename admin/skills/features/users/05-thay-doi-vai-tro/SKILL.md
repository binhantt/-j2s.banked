# SK-05: Thay đổi vai trò

## Mô tả ngắn
Thay đổi vai trò tài khoản. Kích hoạt qua nút "Đổi vai trò". Danh sách vai trò thay đổi theo nhóm (User/Backend) của tài khoản. Super Admin bị khóa.

## Nguồn dữ liệu
- **Store:** `useUsersStore.updateUserRole(id, userType)`
- **API:** `userApi.updateUserRole(id, userType)` → `PUT /admin/users/{id}/update-role`

## Luồng chính

```
Nhấn "Đổi vai trò" (record)
→ openRoleModal(record) → setFieldsValue(role) + setRoleModalVisible(true)

handleUpdateRole()
→ roleForm.validateFields()
→ updateUserRole(selectedUser.id, values.role)
→ PUT /admin/users/{id}/update-role
→ Store: thay thế user trong mảng
→ resetFields() + setRoleModalVisible(false)
```

## Tác vụ
- [x] Mở modal với vai trò hiện tại được chọn sẵn
- [x] Chọn vai trò mới (danh sách theo nhóm)
- [x] Gọi API cập nhật vai trò
- [x] Cập nhật danh sách + reset form + đóng modal

## Danh sách vai trò theo nhóm

| Nhóm | Roles |
|------|-------|
| **User** | job_seeker, freelancer, hr |
| **Backend** | admin, super_admin, moderator, support |

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `openRoleModal()` + `handleUpdateRole()`
- Modal code + Select options động theo nhóm

### `references/`
- API endpoint: PUT /admin/users/{id}/update-role
- Bảng vai trò đầy đủ với label và màu
- Logic convertToUserAdminRow

## Ràng buộc
- **`super_admin`:** Không thể đổi vai trò
- Danh sách vai trò trong Select thay đổi theo nhóm hiện tại của tài khoản
