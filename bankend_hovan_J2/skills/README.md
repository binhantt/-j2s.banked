# Backend Skills — Tài liệu dự án

## Cấu trúc Skills

```
skills/
├── README.md                          ← File này
├── shared/                            ← Tài liệu chung
└── features/
    ├── users/                         ← Quản lý tài khoản
    ├── domains/                       ← Quản lý lĩnh vực
    ├── blog/                         ← Quản lý blog
    └── chat/                         ← Giám sát chat
```

## Công thức cấu trúc mỗi Skill

```
<ten-skill>/
├── SKILL.md         ← File chính (BẮT BUỘC): mô tả, tác vụ, ràng buộc
├── scripts/         ← Code tái sử dụng: controller, service, repository
├── references/      ← Tài liệu tham khảo: entity, response DTO, endpoint
└── assets/         ← Template, diagram (nếu cần)
```

## Backend Architecture

```
presentation/   ← REST Controllers (@RestController)
application/    ← Services + DTOs (Request/Response)
domain/         ← Entities + Repository interfaces
infrastructure/ ← Repository implementations + JPA + Security
```

## API Base URL
```
http://localhost:8080/api
```

## Features

### Users — Quản lý tài khoản

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách tài khoản | `features/users/01-danh-sach-tai-khoan/` |
| 02 | Bật/Tắt tài khoản | `features/users/02-bat-tat-tai-khoan/` |
| 03 | Tạo tài khoản Backend | `features/users/03-tao-tai-khoan/` |
| 04 | Chỉnh sửa tài khoản | `features/users/04-chinh-sua-tai-khoan/` |
| 05 | Thay đổi vai trò | `features/users/05-thay-doi-vai-tro/` |

### Domains — Quản lý lĩnh vực

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách lĩnh vực | `features/domains/01-danh-sach-linh-vuc/` |
| 02 | Xem chi tiết lĩnh vực | `features/domains/02-chi-tiet-linh-vuc/` |
| 03 | Tạo lĩnh vực mới | `features/domains/03-tao-linh-vuc/` |
| 04 | Chỉnh sửa lĩnh vực | `features/domains/04-chinh-sua-linh-vuc/` |
| 05 | Bật/Tắt trạng thái | `features/domains/05-bat-tat-trang-thai/` |
| 06 | Xóa lĩnh vực | `features/domains/06-xoa-linh-vuc/` |

### Blog — Quản lý blog

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách bài viết | `features/blog/01-danh-sach-bai-viet/` |
| 02 | Xem chi tiết bài viết | `features/blog/02-chi-tiet-bai-viet/` |
| 03 | Tạo bài viết mới | `features/blog/03-tao-bai-viet/` |
| 04 | Xóa bài viết | `features/blog/04-xoa-bai-viet/` |

### Chat — Giám sát chat

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách cuộc trò chuyện | `features/chat/01-danh-sach-cuoc-tro-chuyen/` |
| 02 | Xem tin nhắn | `features/chat/02-xem-tin-nhan/` |
