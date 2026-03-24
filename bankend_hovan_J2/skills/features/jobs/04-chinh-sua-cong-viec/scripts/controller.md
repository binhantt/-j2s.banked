# Controller — Chỉnh sửa công việc

```java
// PUT /api/jobs/{id}
@PutMapping("/{id:[0-9]+}")
public ResponseEntity<JobPostingEntityJpa> updateJob(
        @PathVariable Long id,
        @RequestBody JobPostingEntityJpa job) {
    return jobPostingRepository.findById(id)
            .map(existing -> {
                existing.setTitle(job.getTitle());
                existing.setLocation(job.getLocation());
                existing.setSalaryMin(job.getSalaryMin());
                existing.setSalaryMax(job.getSalaryMax());
                existing.setJobType(job.getJobType());
                existing.setLevel(job.getLevel());
                existing.setExperience(job.getExperience());
                existing.setDescription(job.getDescription());
                existing.setRequirements(job.getRequirements());
                existing.setBenefits(job.getBenefits());
                existing.setDeadline(job.getDeadline());
                existing.setStatus(job.getStatus());
                existing.setMaxApplicants(job.getMaxApplicants());
                existing.setInterviewRounds(job.getInterviewRounds());
                return ResponseEntity.ok(jobPostingRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
}
```
