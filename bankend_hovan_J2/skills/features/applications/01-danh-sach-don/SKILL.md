# AP-01: Xem danh sách đơn ứng tuyển

## Mô tả ngắn
Lấy danh sách đơn ứng tuyển. HR xem theo job, ứng viên xem theo user.

## Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/applications/job/{jobId}` | Đơn theo job (HR xem) |
| GET | `/api/applications/user/{userId}` | Đơn theo user (ứng viên xem) |
| GET | `/api/applications/check/{jobId}/{userId}` | Kiểm tra đã nộp chưa |
| GET | `/api/applications/{id}` | Chi tiết đơn theo ID |

## Luồng xử lý

```
GET /api/applications/job/{jobId}
→ applicationRepository.findByJobPostingId(jobId)
→ List<JobApplicationEntityJpa>
→ ResponseEntity.ok(list)

GET /api/applications/user/{userId}
→ applicationRepository.findByUserId(userId)
→ List<JobApplicationEntityJpa>
→ ResponseEntity.ok(list)

GET /api/applications/check/{jobId}/{userId}
→ applicationRepository.findByJobPostingIdAndUserId(jobId, userId)
→ isPresent → true/false
→ ResponseEntity.ok(boolean)
```

## Tác vụ
- [x] HR xem đơn theo job
- [x] Ứng viên xem đơn của mình
- [x] Kiểm tra đã nộp chưa (check duplicate)
- [x] Trả về entity trực tiếp

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/applications/job/{jobId}
- Repository: applicationRepository.findByJobPostingId()

### `references/`
- Entity: JobApplicationEntityJpa
- Repository: JobApplicationJpaRepository

## Ràng buộc
- Trả về Entity trực tiếp (không map DTO)
- check endpoint trả về Boolean, không phải 404
