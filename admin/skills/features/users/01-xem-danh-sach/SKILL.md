# SK-01: Xem danh sách tài khoản

## Mô tả ngắn
Lấy danh sách tất cả tài khoản User & Backend, hiển thị bảng với bộ lọc: tìm kiếm theo tên/email, lọc theo nhóm, lọc theo vai trò, phân trang, thống kê.

## Nguồn dữ liệu
- **Store:** `src/features/users/store/useUsersStore.ts`
- **API:** `userApi.getAllUsers()` → `GET /admin/users`
- **File:** `src/features/users/api/userApi.ts`

## Luồng chính

```
Page mount → useEffect → fetchUsers()
→ API: GET /admin/users → UserResponse[]
→ Store: convertToUserAdminRow() → UserAdminRow[]
→ Component: filteredUsers = users.filter(search + groupFilter + roleFilter)
→ Render: Stats Card + Table
```

## Tác vụ
- [x] Tìm kiếm theo tên hoặc email
- [x] Lọc theo nhóm: User / Backend
- [x] Lọc theo vai trò cụ thể
- [x] Phân trang (10 dòng/trang, showSizeChanger)
- [x] Thống kê (tổng, đang hoạt động) cho mỗi nhóm
- [x] Làm mới danh sách (nút Reload)
- [x] Chuyển tab User ↔ Backend reset filter vai trò về 'all'

## Cách sử dụng code trong thư mục

### `scripts/`
- Các đoạn code chính: gọi store, filter logic, mapping, stats

### `references/`
- Types: `UserResponse`, `UserAdminRow`, `AccountRole`, `AccountGroup`
- API endpoints: GET /admin/users
- Table columns đầy đủ
- Role label & color mapping

### `assets/`
- Template table columns (copy-paste nhanh)
- Mapping table: UserResponse → UserAdminRow

## Ràng buộc
- Lọc hoàn toàn **phía client** — không gọi API khi filter thay đổi
- `super_admin` không thể bị khóa hoặc đổi vai trò
- Chuyển tab → `roleFilter` reset về `'all'`
