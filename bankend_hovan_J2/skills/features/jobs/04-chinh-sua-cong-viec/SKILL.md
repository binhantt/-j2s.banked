# JB-04: Chỉnh sửa công việc

## Mô tả ngắn
Cập nhật thông tin công việc (title, description, salary, requirements, benefits...).

## Endpoint
```
PUT /api/jobs/{id}
```

## Request Body (fields cần update)
```json
{
  "title": "Tên mới",
  "location": "Hà Nội",
  "salaryMin": 10000000,
  "salaryMax": 20000000,
  "jobType": "part-time",
  "level": "mid",
  "experience": "1-3 years",
  "description": "Mô tả mới...",
  "requirements": "Yêu cầu mới...",
  "benefits": "Phúc lợi mới...",
  "deadline": "2026-05-15",
  "status": "active",
  "maxApplicants": 30,
  "interviewRounds": 3
}
```

## Luồng xử lý

```
PUT /api/jobs/{id}
→ jobPostingRepository.findById(id)
  → not found → 404
→ Update tất cả fields từ request body
→ jobPostingRepository.save(existing)
→ @PreUpdate → set updatedAt
→ ResponseEntity.ok(saved)
```

## Tác vụ
- [x] Tìm existing job
- [x] Update tất cả fields (setTitle, setLocation...)
- [x] @PreUpdate tự set updatedAt
- [x] Trả về entity đã update

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT /api/jobs/{id}
- @RequestBody: JobPostingEntityJpa job
- Manual set từng field

### `references/`
- Entity: JobPostingEntityJpa
- Repository: JobPostingJpaRepository

## Ràng buộc
- Không thay đổi userId (HR tạo job = chủ job)
- Không thay đổi createdAt
