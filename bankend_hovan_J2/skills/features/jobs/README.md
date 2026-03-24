# Features/Jobs — Quản lý tin tuyển dụng

## Tổng quan
Controller quản lý tin tuyển dụng (job postings). Endpoints tại `/api/jobs/**`.

## Nguồn files
```
presentation/job/
└── JobPostingController.java         ← Controller
└── JobPostingResponse.java          ← Response DTO

domain/job/
├── entity/JobPosting.java          ← Entity
└── repository/JobPostingRepository.java

infrastructure/persistence/job/
├── JobPostingEntityJpa.java        ← JPA Entity
├── JobPostingJpaRepository.java
└── JobPostingRepositoryImpl.java
```

## Nguồn endpoint

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/jobs` | GET | Lấy tất cả tin tuyển dụng |
| `/api/jobs/active` | GET | Chỉ tin đang active |
| `/api/jobs/search` | GET | Tìm kiếm nâng cao (filter, sort, paginate) |
| `/api/jobs/locations` | GET | Danh sách location đang active |
| `/api/jobs/experiences` | GET | Danh sách experience level đang active |
| `/api/jobs/user/{userId}` | GET | Tin theo HR (userId) |
| `/api/jobs/{id}` | GET | Chi tiết tin tuyển dụng |
| `/api/jobs` | POST | Tạo tin tuyển dụng mới |
| `/api/jobs/{id}` | PUT | Cập nhật tin tuyển dụng |
| `/api/jobs/{id}/toggle-status` | PUT | Toggle active/inactive |
| `/api/jobs/{id}/view` | PUT | Tăng lượt xem +1 |
| `/api/jobs/{id}` | DELETE | Xóa tin tuyển dụng |

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách công việc | `01-danh-sach-cong-viec/` |
| 02 | Xem chi tiết công việc | `02-chi-tiet-cong-viec/` |
| 03 | Tạo công việc | `03-tao-cong-viec/` |
| 04 | Chỉnh sửa công việc | `04-chinh-sua-cong-viec/` |
| 05 | Bật/Tắt trạng thái | `05-bat-tat-trang-thai/` |
| 06 | Xóa công việc | `06-xoa-cong-viec/` |
