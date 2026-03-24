# JB-02: Xem chi tiết công việc

## Mô tả ngắn
Lấy thông tin chi tiết một công việc theo ID, kèm thông tin công ty (name, logo).

## Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/jobs/{id}` | Chi tiết công việc |
| PUT | `/api/jobs/{id}/view` | Tăng lượt xem +1 |

## Luồng xử lý

```
GET /api/jobs/{id}
→ jobPostingRepository.findById(id)
  → not found → 404
→ JobPostingResponse.fromEntity(job)
→ companyRepository.findByHrIdIncludingInactive(job.getUserId())
  → setCompanyName, companyId, companyLogoUrl
→ ResponseEntity.ok(response)
```

## Tác vụ
- [x] Lấy công việc theo ID
- [x] Enrich company name/logo từ userId
- [x] Trả về JobPostingResponse đầy đủ

## Tăng lượt xem
```
PUT /api/jobs/{id}/view
→ jobPostingRepository.findById(id)
→ job.setViews(job.getViews() + 1)
→ jobPostingRepository.save(job)
→ ResponseEntity.ok().build()
```

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/jobs/{id}
- Enrich: companyRepository.findByHrIdIncludingInactive(userId)

### `references/`
- Entity: JobPostingEntityJpa
- Response: JobPostingResponse
- Repository: JobPostingJpaRepository

## Ràng buộc
- Không tìm thấy → 404 Not Found
- Views tăng qua endpoint riêng (không tự động)
