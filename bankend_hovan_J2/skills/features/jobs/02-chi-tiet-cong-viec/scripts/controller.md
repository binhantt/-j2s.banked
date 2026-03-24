# Controller — Chi tiết công việc

```java
// GET /api/jobs/{id}
@GetMapping("/{id:[0-9]+}")
public ResponseEntity<JobPostingResponse> getJob(@PathVariable Long id) {
    return jobPostingRepository.findById(id)
            .map(job -> {
                JobPostingResponse response = JobPostingResponse.fromEntity(job);
                companyRepository.findByHrIdIncludingInactive(job.getUserId()).ifPresent(company -> {
                    response.setCompanyName(company.getName());
                    response.setCompanyId(company.getId());
                    response.setCompanyLogoUrl(company.getLogoUrl());
                });
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
}

// PUT /api/jobs/{id}/view
@PutMapping("/{id:[0-9]+}/view")
public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
    jobPostingRepository.findById(id).ifPresent(job -> {
        job.setViews(job.getViews() + 1);
        jobPostingRepository.save(job);
    });
    return ResponseEntity.ok().build();
}
```

## Lưu ý
- Endpoint search đặt trước `/{id}` trong code (để không bị Spring map "/search" thành path variable)
