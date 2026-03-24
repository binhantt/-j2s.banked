package com.example.bankend_hovan_J2.presentation.job;

import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingJpaRepository;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.SavedJobEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.SavedJobJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-jobs")
@CrossOrigin(originPatterns = "*")
public class SavedJobController {

    private final SavedJobJpaRepository savedJobRepository;
    private final JobPostingJpaRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    public SavedJobController(
            SavedJobJpaRepository savedJobRepository,
            JobPostingJpaRepository jobPostingRepository,
            CompanyRepository companyRepository) {
        this.savedJobRepository = savedJobRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.companyRepository = companyRepository;
    }

    // Save a job
    @PostMapping
    public ResponseEntity<?> saveJob(@RequestBody SaveJobRequest request) {
        try {
            System.out.println("=== POST /api/saved-jobs - Save Job Request ===");
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Job ID: " + request.getJobId());

            // Check if already saved
            if (savedJobRepository.existsByUserIdAndJobId(request.getUserId(), request.getJobId())) {
                System.out.println("Job already saved!");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Job already saved"));
            }

            SavedJobEntityJpa savedJob = new SavedJobEntityJpa();
            savedJob.setUserId(request.getUserId());
            savedJob.setJobId(request.getJobId());

            SavedJobEntityJpa saved = savedJobRepository.save(savedJob);
            System.out.println("=== Job saved successfully! savedId=" + saved.getId() + " ===");

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("ERROR saving job: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save job"));
        }
    }

    // Get user's saved jobs WITH full job details (FIX: single API call, no N+1)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedJobResponse>> getUserSavedJobs(@PathVariable Long userId) {
        System.out.println("=== GET /api/saved-jobs/user/" + userId + " ===");

        List<SavedJobEntityJpa> savedJobs = savedJobRepository.findByUserId(userId);
        System.out.println("Found " + savedJobs.size() + " saved jobs for userId: " + userId);

        List<SavedJobResponse> response = savedJobs.stream()
                .map(this::buildSavedJobResponse)
                .collect(Collectors.toList());

        System.out.println("Returning " + response.size() + " saved job responses");
        return ResponseEntity.ok(response);
    }

    // Build response with job and company details nested under "job"
    private SavedJobResponse buildSavedJobResponse(SavedJobEntityJpa savedJob) {
        SavedJobResponse.SavedJobResponseBuilder builder = SavedJobResponse.builder()
                .id(savedJob.getId())
                .userId(savedJob.getUserId())
                .jobId(savedJob.getJobId())
                .createdAt(savedJob.getCreatedAt());

        // Enrich with job details
        Optional<JobPostingEntityJpa> jobOpt = jobPostingRepository.findById(savedJob.getJobId());
        if (jobOpt.isPresent()) {
            JobPostingEntityJpa job = jobOpt.get();
            System.out.println("  - Processing savedJob id=" + savedJob.getId() + ", jobId=" + savedJob.getJobId() + ", jobTitle=" + job.getTitle());

            SavedJobResponse.JobDetails.JobDetailsBuilder jobBuilder = SavedJobResponse.JobDetails.builder()
                    .id(job.getId())
                    .userId(job.getUserId())
                    .title(job.getTitle())
                    .location(job.getLocation())
                    .salaryMin(job.getSalaryMin())
                    .salaryMax(job.getSalaryMax())
                    .jobType(job.getJobType())
                    .level(job.getLevel())
                    .experience(job.getExperience())
                    .status(job.getStatus())
                    .createdAt(job.getCreatedAt());

            // Enrich with company details
            companyRepository.findByHrIdIncludingInactive(job.getUserId()).ifPresent(company -> {
                System.out.println("    -> Found company: " + company.getName());
                jobBuilder
                        .companyId(company.getId())
                        .companyName(company.getName())
                        .companyLogoUrl(company.getLogoUrl());
            });

            builder.job(jobBuilder.build());
        } else {
            System.out.println("  - WARNING: Job not found for savedJob id=" + savedJob.getId() + ", jobId=" + savedJob.getJobId());
        }

        return builder.build();
    }

    // Check if job is saved
    @GetMapping("/check/{userId}/{jobId}")
    public ResponseEntity<Boolean> checkSaved(@PathVariable Long userId, @PathVariable Long jobId) {
        boolean saved = savedJobRepository.existsByUserIdAndJobId(userId, jobId);
        return ResponseEntity.ok(saved);
    }

    // Unsave a job
    @DeleteMapping("/{userId}/{jobId}")
    @Transactional
    public ResponseEntity<?> unsaveJob(@PathVariable Long userId, @PathVariable Long jobId) {
        try {
            System.out.println("=== Unsave Job Request ===");
            System.out.println("User ID: " + userId);
            System.out.println("Job ID: " + jobId);

            savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
            System.out.println("=== Job unsaved successfully ===");

            return ResponseEntity.ok(Map.of("message", "Job unsaved successfully"));
        } catch (Exception e) {
            System.out.println("ERROR unsaving job: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to unsave job"));
        }
    }
}

class SaveJobRequest {
    private Long userId;
    private Long jobId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
}
