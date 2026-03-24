# CP-02: Xem chi tiết công ty

## Mô tả ngắn
Lấy thông tin chi tiết một công ty theo ID, kèm thông tin lĩnh vực.

## Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/companies/{id}` | Chi tiết (entity thuần) |
| GET | `/api/companies/{id}/with-domain` | Chi tiết kèm domain |
| GET | `/api/companies/{id}/basic-info` | Thông tin cơ bản |

## Luồng xử lý

```
GET /api/companies/{id}/with-domain
→ companyService.getCompanyWithDomain(id)
  → companyRepository.findById(id)
  → not found → Optional.empty()
  → enrich domainName từ domainId
  → CompanyWithDomainResponse
→ Optional → ResponseEntity.ok() hoặc notFound()
```

## Tác vụ
- [x] Lấy công ty theo ID
- [x] Enrich domainName
- [x] Trả về 200 OK hoặc 404 Not Found

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/companies/{id}/with-domain
- Service: CompanyService.getCompanyWithDomain(id)

### `references/`
- Entity: CompanyEntityJpa
- Response: CompanyWithDomainResponse
- Repository: CompanyRepository

## Ràng buộc
- Không tìm thấy → return 404 (Optional → notFound())
