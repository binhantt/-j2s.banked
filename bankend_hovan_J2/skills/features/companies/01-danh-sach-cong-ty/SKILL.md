# CP-01: Xem danh sách công ty

## Mô tả ngắn
Lấy danh sách tất cả công ty, kèm thông tin lĩnh vực (domain) và thông tin cơ bản.

## Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/companies` | Danh sách công ty (entity thuần) |
| GET | `/api/companies/with-domain` | Danh sách kèm thông tin domain |
| GET | `/api/companies/{id}/with-domain` | Chi tiết kèm domain |
| GET | `/api/companies/{id}/basic-info` | Thông tin cơ bản (nhẹ) |
| GET | `/api/companies/hr/{hrId}` | Công ty theo HR ID |
| GET | `/api/companies/hr/{hrId}/with-domain` | Công ty kèm domain theo HR |

## Luồng xử lý

```
GET /api/companies/with-domain
→ companyService.getAllCompaniesWithDomain()
  → companyRepository.findAll()
  → stream: enrich with domainName từ domainId
  → List<CompanyWithDomainResponse>
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy toàn bộ công ty
- [x] Enrich với domain name
- [x] Trả về CompanyWithDomainResponse (name, domainName, size...)
- [x] Endpoint basic-info cho payload nhẹ

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/companies/with-domain
- Service: CompanyService.getAllCompaniesWithDomain()

### `references/`
- Entity: CompanyEntityJpa
- Response: CompanyWithDomainResponse
- Repository: CompanyRepository

## Ràng buộc
- Không phân trang
- companyId vs hrId: công ty được tạo bởi HR, link qua hrId
