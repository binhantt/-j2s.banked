# Controller — Tạo công việc

```java
// POST /api/jobs
@PostMapping
public ResponseEntity<JobPostingEntityJpa> createJob(@RequestBody JobPostingEntityJpa job) {
    JobPostingEntityJpa saved = jobPostingRepository.save(job);
    return ResponseEntity.ok(saved);
}
```

## Request Body
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
  "description": "...",
  "requirements": "...",
  "benefits": "...",
  "deadline": "2026-04-30",
  "maxApplicants": 50,
  "interviewRounds": 2
}
```

## Defaults (@PrePersist)
```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (status == null) status = "active";
    if (applications == null) applications = 0;
    if (views == null) views = 0;
}
```
