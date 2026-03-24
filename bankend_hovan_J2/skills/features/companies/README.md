# Features/Companies — Quản lý công ty

## Tổng quan
Controller quản lý công ty. Endpoints tại `/api/companies/**`.

## Nguồn files
```
presentation/company/
└── CompanyController.java             ← Controller

application/company/
├── CreateCompanyUseCase.java
├── UpdateCompanyUseCase.java
├── CompanyService.java
├── CompanyWithDomainResponse.java
└── CompanyBasicInfoResponse.java

domain/company/
├── entity/Company.java
└── repository/CompanyRepository.java

infrastructure/persistence/company/
├── CompanyEntityJpa.java
├── CompanyJpaRepository.java
└── CompanyRepositoryImpl.java
```

## Nguồn endpoint

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/companies` | GET | Lấy danh sách công ty |
| `/api/companies/with-domain` | GET | Danh sách kèm domain info |
| `/api/companies/{id}` | GET | Chi tiết công ty |
| `/api/companies/{id}/with-domain` | GET | Chi tiết kèm domain |
| `/api/companies/{id}/basic-info` | GET | Thông tin cơ bản (nhẹ) |
| `/api/companies/hr/{hrId}` | GET | Công ty theo HR ID |
| `/api/companies/hr/{hrId}/with-domain` | GET | Công ty kèm domain theo HR |
| `/api/companies/hr/{hrId}/basic-info` | GET | Basic info theo HR |
| `/api/companies` | POST | Tạo công ty mới |
| `/api/companies/{id}` | PUT | Cập nhật công ty |
| `/api/companies/{id}` | DELETE | Xóa công ty |

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách công ty | `01-danh-sach-cong-ty/` |
| 02 | Xem chi tiết công ty | `02-chi-tiet-cong-ty/` |
| 03 | Tạo công ty | `03-tao-cong-ty/` |
| 04 | Chỉnh sửa công ty | `04-chinh-sua-cong-ty/` |
| 05 | Xóa công ty | `05-xoa-cong-ty/` |
