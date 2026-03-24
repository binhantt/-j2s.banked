# AP-05: Xóa đơn ứng tuyển

## Mô tả ngắn
Xóa đơn ứng tuyển. Tự động giảm applications count của job.

## Endpoint
```
DELETE /api/applications/{id}
```

## Luồng xử lý

```
DELETE /api/applications/{id}
→ applicationRepository.findById(id)
  → ifPresent(app):
    → jobPostingRepository.findById(app.getJobPostingId())
      → job.setApplications(Math.max(0, job.getApplications() - 1))
      → jobPostingRepository.save(job)
    → applicationRepository.deleteById(id)
→ ResponseEntity.ok().build()
```

## Tác vụ
- [x] Tự động giảm job.applications -1
- [x] Math.max(0, ...) → không âm
- [x] Xóa khỏi database
- [x] Return 200 OK

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: DELETE /api/applications/{id}
- Update count: jobPostingRepository
- Delete: applicationRepository.deleteById()

### `references/`
- Entity: JobApplicationEntityJpa
- Repository: JobApplicationJpaRepository, JobPostingJpaRepository

## Ràng buộc
- Không kiểm tra trạng thái đơn trước khi xóa
- Không có notification khi xóa
