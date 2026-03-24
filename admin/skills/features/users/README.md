# Features/Users — Quản lý tài khoản

## Tổng quan
Trang quản lý 2 nhóm tài khoản:
- **User:** Ứng viên, Freelancer, HR (người dùng hệ thống)
- **Backend:** Admin, Super Admin, Moderator, Support (vận hành)

## Nguồn files
```
src/features/users/
├── types/userTypes.ts          ← AccountGroup, AccountRole, UserAdminRow
├── api/userApi.ts              ← API chính (/admin/users/*)
├── api/usersApi.ts             ← API phụ (/users) — hiện chưa dùng
├── store/useUsersStore.ts      ← Zustand store
└── pages/UserManagementPage.tsx ← Giao diện
```

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách tài khoản | `01-xem-danh-sach/` |
| 02 | Bật/Tắt tài khoản | `02-bat-tat-tai-khoan/` |
| 03 | Tạo tài khoản Backend | `03-tao-tai-khoan-backend/` |
| 04 | Sửa thông tin đăng nhập | `04-sua-thong-tin-dang-nhap/` |
| 05 | Thay đổi vai trò | `05-thay-doi-vai-tro/` |
