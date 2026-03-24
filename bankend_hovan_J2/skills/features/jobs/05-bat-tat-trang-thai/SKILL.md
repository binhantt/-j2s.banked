# JB-05: Bật / Tắt trạng thái công việc

## Mô tả ngắn
Toggle trạng thái công việc giữa "active" và "inactive".

## Endpoint
```
PUT /api/jobs/{id}/toggle-status
```

## Luồng xử lý

```
PUT /api/jobs/{id}/toggle-status
→ jobPostingRepository.findById(id)
  → not found → 404
→ Toggle: job.getStatus().equals("active") ? "inactive" : "active"
→ jobPostingRepository.save(job)
→ ResponseEntity.ok(saved)
```

## Tác vụ
- [x] Toggle status active ↔ inactive
- [x] Không cần request body
- [x] @PreUpdate set updatedAt

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT /api/jobs/{id}/toggle-status

### `references/`
- Entity: JobPostingEntityJpa
- Fields: status = "active" | "inactive"
- Repository: JobPostingJpaRepository

## Ràng buộc
- Không kiểm tra deadline hay maxApplicants ở đây
- Auto-close do @PostApply khi đạt maxApplicants (trong application)
