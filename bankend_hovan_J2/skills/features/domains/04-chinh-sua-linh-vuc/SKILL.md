# DM-04: Chỉnh sửa lĩnh vực

## Mô tả ngắn
Cập nhật tên, mô tả, trạng thái của lĩnh vực. Tên mới phải duy nhất (không trùng với lĩnh vực khác).

## Endpoint
```
PUT /api/domains/{id}
```

## Request Body
```json
{
  "name": "Tên mới",
  "description": "Mô tả mới",
  "isActive": true
}
```

## Luồng xử lý

```
PUT /api/domains/{id}
→ @Valid @RequestBody CreateDomainRequest
→ domainService.updateDomain(id, request)
  → domainRepository.findById(id)
    → not found → throw RuntimeException
  → !domain.getName().equals(request.getName())
      && domainRepository.existsByName(request.getName())?
    → true → throw RuntimeException("Lĩnh vực với tên này đã tồn tại")
  → domain.setName(name)
  → domain.setDescription(description)
  → domain.setIsActive(isActive ?? domain.getIsActive())
  → domainRepository.save(domain)
  → DomainResponse.from(savedDomain)
→ ResponseEntity.ok(response)
```

## Tác vụ
- [x] Validate tồn tại
- [x] Validate tên mới không trùng (trừ chính nó)
- [x] isActive: giữ nguyên nếu không gửi
- [x] Lưu và trả về DomainResponse

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT /api/domains/{id}
- Service: DomainService.updateDomain(id, request)

### `references/`
- Request DTO: CreateDomainRequest (reuse)
- Entity: Domain
- Response: DomainResponse

## Ràng buộc
- isActive optional — giữ nguyên giá trị cũ nếu không gửi
- Tên mới phải unique (loại trừ chính nó)
