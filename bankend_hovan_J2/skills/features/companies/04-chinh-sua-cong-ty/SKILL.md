# CP-04: Chỉnh sửa công ty

## Mô tả ngắn
Cập nhật thông tin công ty (logo, mô tả, lĩnh vực, phúc lợi...).

## Endpoint
```
PUT /api/companies/{id}
```

## Request Body
```json
{
  "name": "Tên mới",
  "logoUrl": "https://...",
  "domainId": 2,
  "companySize": "100-500",
  "foundedYear": 2019,
  "website": "https://new.com",
  "email": "new@email.com",
  "phone": "0909876543",
  "address": "Hà Nội",
  "description": "Mô tả mới",
  "mission": "Sứ mệnh mới",
  "vision": "Tầm nhìn mới",
  "values": "Giá trị mới",
  "benefits": "Phúc lợi mới",
  "workingHours": "8:30-17:30",
  "imageGallery": null
}
```

## Luồng xử lý

```
PUT /api/companies/{id}
→ @RequestBody Map<String, Object> request
→ mapToCompany(request)
→ updateCompanyUseCase.execute(id, company)
  → findById → not found → throw RuntimeException
  → update fields
  → companyRepository.save(company)
→ ResponseEntity.ok(updated)
```

## Tác vụ
- [x] Map request body → Company entity
- [x] Dùng UpdateCompanyUseCase
- [x] Không tìm thấy → throw RuntimeException
- [x] @PreUpdate → tự động set updatedAt

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT /api/companies/{id}
- mapToCompany: helper build entity từ Map
- UseCase: UpdateCompanyUseCase.execute(id, company)

### `references/`
- Entity: Company
- UseCase: UpdateCompanyUseCase

## Ràng buộc
- hrId không được thay đổi khi update
- Không tìm thấy → throw RuntimeException
