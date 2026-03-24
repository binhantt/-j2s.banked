# AP-03: Nộp đơn ứng tuyển

## Mô tả ngắn
Ứng viên nộp đơn ứng tuyển vào một job. Tự động tăng applications count và auto-close job khi đạt max.

## Endpoint
```
POST /api/applications
```

## Request Body
```json
{
  "jobPostingId": 123,
  "userId": 456,
  "cvUrl": "https://storage.cv/abc.pdf",
  "coverLetter": "Xin chào, tôi muốn ứng tuyển..."
}
```

## Luồng xử lý

```
POST /api/applications
→ Validate jobPostingId != null
→ Validate userId != null
→ Check duplicate:
  → applicationRepository.findByJobPostingIdAndUserId(jobId, userId)
  → isPresent → return 400 "User already applied"
→ applicationRepository.save(application)
  → @PrePersist: status="pending", userConfirmed=false, currentRound=0, createdAt, updatedAt
→ Update job count:
  → jobPostingRepository.findById(jobPostingId)
  → job.setApplications(job.getApplications() + 1)
  → Check maxApplicants:
    → applications >= maxApplicants → job.setStatus("closed")
  → jobPostingRepository.save(job)
→ ResponseEntity.ok(saved)
```

## Tác vụ
- [x] Validate required fields (jobPostingId, userId)
- [x] Check duplicate application (1 user / 1 job)
- [x] Tự động tăng job.applications +1
- [x] Auto-close job khi đạt maxApplicants
- [x] @PrePersist set defaults

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: POST /api/applications
- Validate: kiểm tra jobPostingId, userId != null
- Duplicate check: applicationRepository.findByJobPostingIdAndUserId()
- Update count: jobPostingRepository

### `references/`
- Entity: JobApplicationEntityJpa
- Fields: status="pending", userConfirmed=false, currentRound=0
- Repository: JobApplicationJpaRepository, JobPostingJpaRepository

## Ràng buộc
- 1 user chỉ nộp được 1 đơn / 1 job
- Auto-close: khi maxApplicants != null && applications >= maxApplicants
- CV URL là string (file đã upload lên storage trước đó)
