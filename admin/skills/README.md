# Admin Skills — Tài liệu dự án

## Cấu trúc Skills

```
skills/
├── README.md                          ← File này
├── shared/
│   ├── project-structure.md            ← Cấu trúc project, routing
│   └── http-client.md                  ← Hướng dẫn httpClient
└── features/
    ├── users/                         ← Quản lý tài khoản
    ├── domains/                       ← Quản lý lĩnh vực
    ├── blog/                          ← Quản lý blog
    └── chat/                          ← Giám sát chat
```

## Công thức cấu trúc mỗi Skill

```
<ten-skill>/
├── SKILL.md         ← File chính (BẮT BUỘC): mô tả, tác vụ, ràng buộc
├── scripts/         ← Code tái sử dụng: store, API, component logic
├── references/      ← Tài liệu tham khảo: types, endpoints, mapping
└── assets/         ← Template, font, icon (nếu cần)
```

## Features

### Users — Quản lý tài khoản

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách tài khoản | `features/users/01-xem-danh-sach/` |
| 02 | Bật/Tắt tài khoản | `features/users/02-bat-tat-tai-khoan/` |
| 03 | Tạo tài khoản Backend | `features/users/03-tao-tai-khoan-backend/` |
| 04 | Sửa thông tin đăng nhập | `features/users/04-sua-thong-tin-dang-nhap/` |
| 05 | Thay đổi vai trò | `features/users/05-thay-doi-vai-tro/` |

### Domains — Quản lý lĩnh vực

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách lĩnh vực | `features/domains/01-xem-danh-sach/` |
| 02 | Xem chi tiết lĩnh vực | `features/domains/02-chi-tiet-linh-vuc/` |
| 03 | Tạo lĩnh vực mới | `features/domains/03-tao-linh-vuc/` |
| 04 | Chỉnh sửa lĩnh vực | `features/domains/04-chinh-sua-linh-vuc/` |
| 05 | Bật/Tắt trạng thái | `features/domains/05-bat-tat-trang-thai/` |
| 06 | Xóa lĩnh vực | `features/domains/06-xoa-linh-vuc/` |

### Blog — Quản lý blog

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách bài viết | `features/blog/01-xem-danh-sach/` |
| 02 | Xem chi tiết bài viết | `features/blog/02-chi-tiet-bai-viet/` |
| 03 | Tạo bài viết mới | `features/blog/03-tao-bai-viet/` |
| 04 | Xóa bài viết | `features/blog/04-xoa-bai-viet/` |

### Chat — Giám sát chat

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách cuộc trò chuyện | `features/chat/01-danh-sach-cuoc-tro-chuyen/` |
| 02 | Xem tin nhắn | `features/chat/02-xem-tin-nhan/` |
