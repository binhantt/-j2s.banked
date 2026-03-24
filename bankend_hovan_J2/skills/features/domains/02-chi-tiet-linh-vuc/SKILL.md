# DM-02: Xem chi tiết lĩnh vực

## Mô tả ngắn
Lấy thông tin chi tiết một lĩnh vực theo ID.

## Endpoint
```
GET /api/domains/{id}
```

## Luồng xử lý

```
GET /api/domains/{id}
→ domainService.getDomainById(id)
  → domainRepository.findById(id)
  → not found → throw RuntimeException
  → DomainResponse.from(domain)
  → jobCount = jobPostingRepository.countActiveJobsByDomainId(id)
→ ResponseEntity.ok(response)
→ RuntimeException → 500 (hoặc handle ở GlobalExceptionHandler)
```

## Tác vụ
- [x] Lấy lĩnh vực theo ID
- [x] Nếu không tìm thấy → throw RuntimeException
- [x] Đếm số công việc active
- [x] Trả về DomainResponse

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/domains/{id}
- Service: DomainService.getDomainById(id)

### `references/`
- Entity: Domain
- Response: DomainResponse
- Exception: RuntimeException("Không tìm thấy lĩnh vực với ID: " + id)

## Ràng buộc
- Không tìm thấy → throw RuntimeException (backend không trả 404 mặc định)
