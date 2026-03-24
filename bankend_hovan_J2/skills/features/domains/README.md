# Features/Domains — Quản lý lĩnh vực

## Tổng quan
Controller quản lý lĩnh vực nghề nghiệp. Endpoints tại `/api/domains/**`.

## Nguồn files
```
presentation/domain/
└── DomainController.java             ← Controller

application/domain/
├── DomainService.java                ← Business logic
├── CreateDomainRequest.java          ← Request DTO
└── DomainResponse.java               ← Response DTO

domain/domain/
├── entity/Domain.java               ← Entity
└── repository/DomainRepository.java ← Repository interface
```

## Nguồn endpoint

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/domains` | GET | Lấy danh sách tất cả lĩnh vực |
| `/api/domains/{id}` | GET | Lấy lĩnh vực theo ID |
| `/api/domains/status/{isActive}` | GET | Lọc theo trạng thái |
| `/api/domains` | POST | Tạo lĩnh vực mới |
| `/api/domains/{id}` | PUT | Cập nhật lĩnh vực |
| `/api/domains/{id}/status` | PATCH | Toggle trạng thái |
| `/api/domains/{id}` | DELETE | Xóa lĩnh vực |

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách lĩnh vực | `01-danh-sach-linh-vuc/` |
| 02 | Xem chi tiết lĩnh vực | `02-chi-tiet-linh-vuc/` |
| 03 | Tạo lĩnh vực mới | `03-tao-linh-vuc/` |
| 04 | Chỉnh sửa lĩnh vực | `04-chinh-sua-linh-vuc/` |
| 05 | Bật/Tắt trạng thái | `05-bat-tat-trang-thai/` |
| 06 | Xóa lĩnh vực | `06-xoa-linh-vuc/` |
