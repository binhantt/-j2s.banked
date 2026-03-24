# Features/Applications — Quản lý đơn ứng tuyển

## Tổng quan
Controller quản lý đơn ứng tuyển (job applications). Endpoints tại `/api/applications/**`.

## Nguồn files
```
presentation/application/
└── JobApplicationController.java     ← Controller

domain/application/
├── entity/JobApplication.java      ← Entity
└── repository/JobApplicationRepository.java

infrastructure/persistence/application/
├── JobApplicationEntityJpa.java     ← JPA Entity
└── JobApplicationJpaRepository.java
```

## Nguồn endpoint

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/applications` | POST | Nộp đơn ứng tuyển |
| `/api/applications/{id}` | GET | Chi tiết đơn |
| `/api/applications/job/{jobId}` | GET | Danh sách đơn theo job (HR) |
| `/api/applications/user/{userId}` | GET | Danh sách đơn theo user (ứng viên) |
| `/api/applications/check/{jobId}/{userId}` | GET | Kiểm tra đã nộp chưa |
| `/api/applications/{id}/status` | PUT | Cập nhật trạng thái đơn |
| `/api/applications/{id}/round` | PUT | Cập nhật vòng phỏng vấn (pass/fail) |
| `/api/applications/{id}/confirm` | PUT | Ứng viên xác nhận đi làm |
| `/api/applications/{id}` | DELETE | Xóa đơn ứng tuyển |

## Trạng thái đơn

```
pending → reviewing → accepted
                    → rejected
```

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách đơn | `01-danh-sach-don/` |
| 02 | Xem chi tiết đơn | `02-chi-tiet-don/` |
| 03 | Nộp đơn ứng tuyển | `03-nop-don/` |
| 04 | Cập nhật trạng thái | `04-cap-nhat-trang-thai/` |
| 05 | Xóa đơn | `05-xoa-don/` |
