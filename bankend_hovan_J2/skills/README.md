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
    ├── chat/                         ← Giám sát chat
    ├── companies/                    ← Quản lý công ty
    ├── jobs/                         ← Quản lý tin tuyển dụng
    └── applications/                 ← Quản lý đơn ứng tuyển
```

## Công thức cấu trúc mỗi Skill

```
<ten-skill>/
├── SKILL.md         ← File chính (BẮT BUỘC): mô tả, tác vụ, ràng buộc
├── scripts/         ← Code tái sử dụng: controller, service, repository
├── references/      ← Tài liệu tham khảo: entity, response DTO, endpoint
└── assets/         ← Template, diagram (nếu cần)
```

## Quy ước đánh số Skill

Mỗi feature có prefix riêng tránh trùng:

| Prefix | Feature |
|--------|---------|
| SC | Security — Bảo mật (Rate Limit, JWT) |
| US | Users — Quản lý tài khoản |
| DM | Domains — Quản lý lĩnh vực |
| BL | Blog — Quản lý blog |
| CH | Chat — Giám sát chat |
| CP | Companies — Quản lý công ty |
| JB | Jobs — Quản lý tin tuyển dụng |
| AP | Applications — Quản lý đơn ứng tuyển |

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

### Security (SC) — Bảo mật & Rate Limit

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Cấu hình Rate Limit từ application.yml | `features/security/01-rate-limit-config/` |
| 02 | JWT Security Hardening (Refresh Token Rotation + Blacklist) | `features/security/02-jwt-security/` |
| 03 | Endpoint-Specific Rate Limit (auth strict / read loose) | `features/security/03-endpoint-rate-limit/` |

### Users (US) — Quản lý tài khoản

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách tài khoản | `features/users/01-danh-sach-tai-khoan/` |
| 02 | Bật/Tắt tài khoản | `features/users/02-bat-tat-tai-khoan/` |
| 03 | Tạo tài khoản Backend | `features/users/03-tao-tai-khoan/` |
| 04 | Chỉnh sửa tài khoản | `features/users/04-chinh-sua-tai-khoan/` |
| 05 | Thay đổi vai trò | `features/users/05-thay-doi-vai-tro/` |

### Domains (DM) — Quản lý lĩnh vực

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách lĩnh vực | `features/domains/01-danh-sach-linh-vuc/` |
| 02 | Xem chi tiết lĩnh vực | `features/domains/02-chi-tiet-linh-vuc/` |
| 03 | Tạo lĩnh vực mới | `features/domains/03-tao-linh-vuc/` |
| 04 | Chỉnh sửa lĩnh vực | `features/domains/04-chinh-sua-linh-vuc/` |
| 05 | Bật/Tắt trạng thái | `features/domains/05-bat-tat-trang-thai/` |
| 06 | Xóa lĩnh vực | `features/domains/06-xoa-linh-vuc/` |

### Blog (BL) — Quản lý blog

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách bài viết | `features/blog/01-danh-sach-bai-viet/` |
| 02 | Xem chi tiết bài viết | `features/blog/02-chi-tiet-bai-viet/` |
| 03 | Tạo bài viết mới | `features/blog/03-tao-bai-viet/` |
| 04 | Xóa bài viết | `features/blog/04-xoa-bai-viet/` |

### Chat (CH) — Giám sát chat

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách cuộc trò chuyện | `features/chat/01-danh-sach-cuoc-tro-chuyen/` |
| 02 | Xem tin nhắn | `features/chat/02-xem-tin-nhan/` |

### Companies (CP) — Quản lý công ty

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách công ty | `features/companies/01-danh-sach-cong-ty/` |
| 02 | Xem chi tiết công ty | `features/companies/02-chi-tiet-cong-ty/` |
| 03 | Tạo công ty | `features/companies/03-tao-cong-ty/` |
| 04 | Chỉnh sửa công ty | `features/companies/04-chinh-sua-cong-ty/` |
| 05 | Xóa công ty | `features/companies/05-xoa-cong-ty/` |

### Jobs (JB) — Quản lý tin tuyển dụng

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách công việc | `features/jobs/01-danh-sach-cong-viec/` |
| 02 | Xem chi tiết công việc | `features/jobs/02-chi-tiet-cong-viec/` |
| 03 | Tạo công việc | `features/jobs/03-tao-cong-viec/` |
| 04 | Chỉnh sửa công việc | `features/jobs/04-chinh-sua-cong-viec/` |
| 05 | Bật/Tắt trạng thái | `features/jobs/05-bat-tat-trang-thai/` |
| 06 | Xóa công việc | `features/jobs/06-xoa-cong-viec/` |

### Applications (AP) — Quản lý đơn ứng tuyển

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách đơn | `features/applications/01-danh-sach-don/` |
| 02 | Xem chi tiết đơn | `features/applications/02-chi-tiet-don/` |
| 03 | Nộp đơn ứng tuyển | `features/applications/03-nop-don/` |
| 04 | Cập nhật trạng thái | `features/applications/04-cap-nhat-trang-thai/` |
| 05 | Xóa đơn | `features/applications/05-xoa-don/` |
