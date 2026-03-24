# Controller — Danh sách đơn ứng tuyển

```java
@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationJpaRepository applicationRepository;

    // Get applications for a job (HR view)
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplicationEntityJpa>> getJobApplications(@PathVariable Long jobId) {
        List<JobApplicationEntityJpa> applications = applicationRepository.findByJobPostingId(jobId);
        return ResponseEntity.ok(applications);
    }

    // Get user's applications (Job seeker view)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplicationEntityJpa>> getUserApplications(@PathVariable Long userId) {
        List<JobApplicationEntityJpa> applications = applicationRepository.findByUserId(userId);
        return ResponseEntity.ok(applications);
    }

    // Check if user applied
    @GetMapping("/check/{jobId}/{userId}")
    public ResponseEntity<Boolean> checkApplied(@PathVariable Long jobId, @PathVariable Long userId) {
        boolean applied = applicationRepository.findByJobPostingIdAndUserId(jobId, userId).isPresent();
        return ResponseEntity.ok(applied);
    }

    // Get application by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationEntityJpa> getApplication(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

## Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/applications/job/{jobId}` | HR xem đơn theo job |
| GET | `/api/applications/user/{userId}` | Ứng viên xem đơn của mình |
| GET | `/api/applications/check/{jobId}/{userId}` | Kiểm tra đã nộp chưa |
| GET | `/api/applications/{id}` | Chi tiết đơn |
