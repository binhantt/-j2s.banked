# Features/Users — Quản lý tài khoản

## Tổng quan
Controller quản lý tài khoản User & Backend. Tất cả endpoints đặt tại `/api/admin/users/**`.

## Nguồn files
```
presentation/admin/
└── UserManagementController.java      ← Controller

domain/user/
├── entity/User.java                   ← Entity
└── repository/UserRepository.java    ← Repository interface

infrastructure/persistence/user/
└── UserJpaRepository.java            ← JPA Repository
└── UserEntityJpa.java               ← JPA Entity

infrastructure/security/
└── AesGcmCryptoService.java          ← Mã hóa password
```

## Nguồn endpoint admin API

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/admin/users` | GET | Lấy danh sách tất cả user |
| `/api/admin/users/{id}` | GET | Lấy user theo ID |
| `/api/admin/users/{id}/toggle-status` | PUT | Toggle active/inactive |
| `/api/admin/users/{id}/activate` | PUT | Kích hoạt user |
| `/api/admin/users/{id}/deactivate` | PUT | Vô hiệu hóa user |
| `/api/admin/users/create` | POST | Tạo tài khoản backend |
| `/api/admin/users/{id}/update-role` | PUT | Cập nhật vai trò |
| `/api/admin/users/{id}/update-credentials` | PUT | Cập nhật email/password |

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách tài khoản | `01-danh-sach-tai-khoan/` |
| 02 | Bật/Tắt tài khoản | `02-bat-tat-tai-khoan/` |
| 03 | Tạo tài khoản Backend | `03-tao-tai-khoan/` |
| 04 | Chỉnh sửa tài khoản | `04-chinh-sua-tai-khoan/` |
| 05 | Thay đổi vai trò | `05-thay-doi-vai-tro/` |
