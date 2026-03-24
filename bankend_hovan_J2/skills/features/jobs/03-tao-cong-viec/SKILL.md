# JB-03: Tạo công việc

## Mô tả ngắn
HR tạo tin tuyển dụng mới. Mặc định status = "active", applications = 0, views = 0.

## Endpoint
```
POST /api/jobs
```

## Request Body (JobPostingEntityJpa)
```json
{
  "userId": 123,
  "title": "Senior Java Developer",
  "location": "TP.HCM",
  "salaryMin": 15000000,
  "salaryMax": 25000000,
  "jobType": "full-time",
  "level": "senior",
  "experience": "3-5 years",
  "description": "Mô tả công việc...",
  "requirements": "Yêu cầu...",
  "benefits": "Phúc lợi...",
  "deadline": "2026-04-30",
  "status": "active",
  "maxApplicants": 50,
  "interviewRounds": 2
}
```

## Luồng xử lý

```
POST /api/jobs
→ @RequestBody JobPostingEntityJpa job
→ jobPostingRepository.save(job)
  → @PrePersist: status="active", applications=0, views=0, createdAt, updatedAt
→ ResponseEntity.ok(saved)
```

## Tác vụ
- [x] Nhận JobPostingEntityJpa trực tiếp (không có wrapper DTO)
- [x] @PrePersist tự set defaults
- [x] Trả về entity đã tạo

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: POST /api/jobs
- @RequestBody: nhận trực tiếp JobPostingEntityJpa

### `references/`
- Entity: JobPostingEntityJpa
- Repository: JobPostingJpaRepository

## Ràng buộc
- userId = HR user ID (từ JWT)
- maxApplicants = null → không giới hạn
- interviewRounds mặc định = 1
