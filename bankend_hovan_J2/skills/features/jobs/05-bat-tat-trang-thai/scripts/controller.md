# Controller — Toggle trạng thái công việc

```java
// PUT /api/jobs/{id}/toggle-status
@PutMapping("/{id:[0-9]+}/toggle-status")
public ResponseEntity<JobPostingEntityJpa> toggleStatus(@PathVariable Long id) {
    return jobPostingRepository.findById(id)
            .map(job -> {
                job.setStatus(job.getStatus().equals("active") ? "inactive" : "active");
                return ResponseEntity.ok(jobPostingRepository.save(job));
            })
            .orElse(ResponseEntity.notFound().build());
}
```

## Trạng thái
| Status | Mô tả |
|--------|-------|
| `active` | Đang tuyển |
| `inactive` | Tạm dừng |
| `closed` | Đã đóng (auto khi đạt maxApplicants) |
