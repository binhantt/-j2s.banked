# Controller — Nộp đơn ứng tuyển

```java
// POST /api/applications
@PostMapping
public ResponseEntity<JobApplicationEntityJpa> applyJob(@RequestBody JobApplicationEntityJpa application) {
    // Validate required fields
    if (application.getJobPostingId() == null) {
        return ResponseEntity.badRequest().build();
    }
    if (application.getUserId() == null) {
        return ResponseEntity.badRequest().build();
    }

    // Check duplicate
    if (applicationRepository.findByJobPostingIdAndUserId(
            application.getJobPostingId(), application.getUserId()
    ).isPresent()) {
        return ResponseEntity.badRequest().build();
    }

    JobApplicationEntityJpa saved = applicationRepository.save(application);

    // Update job application count
    jobPostingRepository.findById(application.getJobPostingId()).ifPresent(job -> {
        job.setApplications(job.getApplications() + 1);

        // Auto-close if reached maxApplicants
        if (job.getMaxApplicants() != null && job.getApplications() >= job.getMaxApplicants()) {
            job.setStatus("closed");
        }

        jobPostingRepository.save(job);
    });

    return ResponseEntity.ok(saved);
}
```

## Request Body
```json
{
  "jobPostingId": 123,
  "userId": 456,
  "cvUrl": "https://storage.cv/abc.pdf",
  "coverLetter": "Thư xin việc..."
}
```

## Defaults (@PrePersist)
```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (status == null) status = "pending";
}
```
