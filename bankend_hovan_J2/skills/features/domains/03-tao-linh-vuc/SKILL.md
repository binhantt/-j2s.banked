# DM-03: Tạo lĩnh vực mới

## Mô tả ngắn
Tạo lĩnh vực nghề nghiệp mới. Tên lĩnh vực phải là duy nhất.

## Endpoint
```
POST /api/domains
```

## Request Body
```json
{
  "name": "Công nghệ thông tin",
  "description": "Mô tả lĩnh vực",
  "isActive": true
}
```

## Luồng xử lý

```
POST /api/domains
→ @Valid @RequestBody CreateDomainRequest
→ domainService.createDomain(request)
  → domainRepository.existsByName(name)?
    → true → throw RuntimeException("Lĩnh vực với tên này đã tồn tại")
  → Domain.builder()
      .name(request.getName())
      .description(request.getDescription())
      .isActive(request.getIsActive() ?? true)
      .jobCount(0)
      .build()
  → domainRepository.save(domain)
  → DomainResponse.from(savedDomain)
→ ResponseEntity.ok(response)
```

## Tác vụ
- [x] Validate tên chưa tồn tại
- [x] isActive mặc định = true nếu không gửi
- [x] jobCount = 0 khi tạo mới
- [x] Lưu và trả về DomainResponse

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: POST /api/domains
- Service: DomainService.createDomain(request)

### `references/`
- Request DTO: CreateDomainRequest
- Entity: Domain
- Response: DomainResponse

## Ràng buộc
- Tên lĩnh vực phải duy nhất
- @Valid annotation → validate required fields (name)
