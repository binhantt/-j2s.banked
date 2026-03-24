# Controller — Xóa đơn ứng tuyển

```java
// DELETE /api/applications/{id}
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
    applicationRepository.findById(id).ifPresent(app -> {
        // Decrease application count
        jobPostingRepository.findById(app.getJobPostingId()).ifPresent(job -> {
            job.setApplications(Math.max(0, job.getApplications() - 1));
            jobPostingRepository.save(job);
        });
        applicationRepository.deleteById(id);
    });
    return ResponseEntity.ok().build();
}
```
