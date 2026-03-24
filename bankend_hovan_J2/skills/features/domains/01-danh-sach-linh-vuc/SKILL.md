# DM-01: Xem danh sách lĩnh vực

## Mô tả ngắn
Lấy danh sách tất cả lĩnh vực nghề nghiệp, kèm số lượng công việc active trong mỗi lĩnh vực.

## Endpoint
```
GET /api/domains
```

## Luồng xử lý

```
GET /api/domains
→ domainService.getAllDomains()
  → domainRepository.findAll()
  → stream: với mỗi domain
    → DomainResponse.from(domain)
    → jobCount = jobPostingRepository.countActiveJobsByDomainId(id)
  → collect → List<DomainResponse>
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy toàn bộ lĩnh vực từ database
- [x] Đếm số công việc active trong mỗi lĩnh vực
- [x] Map Domain → DomainResponse
- [x] Trả về danh sách

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/domains
- Service: DomainService.getAllDomains()
- Response mapping với jobCount

### `references/`
- Entity: Domain
- Response: DomainResponse
- Repository: DomainRepository, JobPostingRepository

## Ràng buộc
- jobCount = số công việc đang active trong lĩnh vực đó
- Không phân trang
