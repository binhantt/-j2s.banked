# DM-05: Bật / Tắt trạng thái lĩnh vực

## Mô tả ngắn
Kích hoạt hoặc vô hiệu hóa lĩnh vực bằng PATCH.

## Endpoint
```
PATCH /api/domains/{id}/status
```

## Request Body
```json
{
  "isActive": true
}
```

## Luồng xử lý

```
PATCH /api/domains/{id}/status
→ @RequestBody Map<String, Boolean> request
→ isActive == null → return 400 badRequest
→ domainService.toggleDomainStatus(id, isActive)
  → domainRepository.findById(id)
    → not found → throw RuntimeException
  → domain.setIsActive(isActive)
  → domainRepository.save(domain)
  → DomainResponse.from(savedDomain)
→ ResponseEntity.ok(response)
```

## Tác vụ
- [x] Validate isActive != null
- [x] isActive = null → return 400
- [x] Cập nhật trạng thái
- [x] Trả về DomainResponse

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PATCH /api/domains/{id}/status
- Service: DomainService.toggleDomainStatus(id, isActive)

### `references/`
- Method: PATCH (không phải PUT)
- Body: `{ isActive: boolean }`

## Ràng buộc
- Dùng PATCH (không PUT) — chỉ cập nhật 1 trường
- isActive bắt buộc trong request body
