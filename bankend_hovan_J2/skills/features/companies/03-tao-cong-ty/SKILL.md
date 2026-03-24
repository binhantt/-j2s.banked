# CP-03: Tạo công ty

## Mô tả ngắn
Tạo công ty mới cho HR. Dùng UseCase để tách biệt business logic.

## Endpoint
```
POST /api/companies
```

## Request Body
```json
{
  "hrId": 123,
  "name": "Công ty ABC",
  "logoUrl": null,
  "domainId": 1,
  "companySize": "50-100",
  "foundedYear": 2020,
  "website": "https://abc.com",
  "email": "contact@abc.com",
  "phone": "0901234567",
  "address": "TP.HCM",
  "description": "Mô tả công ty",
  "mission": "Sứ mệnh",
  "vision": "Tầm nhìn",
  "values": "Giá trị cốt lõi",
  "benefits": "Phúc lợi",
  "workingHours": "9:00-18:00",
  "imageGallery": null
}
```

## Luồng xử lý

```
POST /api/companies
→ @RequestBody Map<String, Object> request
→ mapToCompany(request) — build Company entity
→ createCompanyUseCase.execute(company)
  → validate hrId
  → companyRepository.save(company)
→ ResponseEntity.ok(created)
```

## Tác vụ
- [x] Map request body → Company entity
- [x] Dùng CreateCompanyUseCase (tách logic nghiệp vụ)
- [x] Trả về Company entity đã tạo

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: POST /api/companies
- mapToCompany: helper build entity từ Map
- UseCase: CreateCompanyUseCase.execute(company)

### `references/`
- Entity: Company
- UseCase: CreateCompanyUseCase
- Controller mapToCompany helper

## Ràng buộc
- hrId bắt buộc — liên kết công ty với HR user
- @PrePersist → tự động set createdAt, updatedAt
