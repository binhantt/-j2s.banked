package com.example.bankend_hovan_J2.presentation.job;

import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingJpaRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    // Get all job postings
    @GetMapping
    public ResponseEntity<List<JobPostingResponse>> getAllJobs() {
        List<JobPostingEntityJpa> jobs = jobPostingRepository.findAll();
        return ResponseEntity.ok(enrichWithCompanyName(jobs));
    }

    // Get active job postings
    @GetMapping("/active")
    public ResponseEntity<List<JobPostingResponse>> getActiveJobs() {
        List<JobPostingEntityJpa> jobs = jobPostingRepository.findByStatus("active");
        return ResponseEntity.ok(enrichWithCompanyName(jobs));
    }

    // Get job postings by user (HR)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobPostingResponse>> getJobsByUser(@PathVariable Long userId) {
        List<JobPostingEntityJpa> jobs = jobPostingRepository.findByUserId(userId);
        return ResponseEntity.ok(enrichWithCompanyName(jobs));
    }

    // Get single job posting
    @GetMapping("/{id}")
    public ResponseEntity<JobPostingResponse> getJob(@PathVariable Long id) {
        return jobPostingRepository.findById(id)
                .map(job -> {
                    JobPostingResponse response = JobPostingResponse.fromEntity(job);
                    // Add company name and logo
                    companyRepository.findByHrId(job.getUserId()).ifPresent(company -> {
                        response.setCompanyName(company.getName());
                        response.setCompanyId(company.getId());
                        response.setCompanyLogoUrl(company.getLogoUrl());
                    });
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Create job posting
    @PostMapping
    public ResponseEntity<JobPostingEntityJpa> createJob(@RequestBody JobPostingEntityJpa job) {
        JobPostingEntityJpa saved = jobPostingRepository.save(job);
        return ResponseEntity.ok(saved);
    }

    // Update job posting
    @PutMapping("/{id}")
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
                    return ResponseEntity.ok(jobPostingRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Toggle job status (active/inactive)
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<JobPostingEntityJpa> toggleStatus(@PathVariable Long id) {
        return jobPostingRepository.findById(id)
                .map(job -> {
                    job.setStatus(job.getStatus().equals("active") ? "inactive" : "active");
                    return ResponseEntity.ok(jobPostingRepository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Increment views
    @PutMapping("/{id}/view")
    public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
        jobPostingRepository.findById(id).ifPresent(job -> {
            job.setViews(job.getViews() + 1);
            jobPostingRepository.save(job);
        });
        return ResponseEntity.ok().build();
    }

    // Delete job posting
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobPostingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    // Helper method to enrich jobs with company name
    private List<JobPostingResponse> enrichWithCompanyName(List<JobPostingEntityJpa> jobs) {
        return jobs.stream().map(job -> {
            JobPostingResponse response = JobPostingResponse.fromEntity(job);
            // Add company name and logo
            companyRepository.findByHrId(job.getUserId()).ifPresent(company -> {
                response.setCompanyName(company.getName());
                response.setCompanyId(company.getId());
                response.setCompanyLogoUrl(company.getLogoUrl());
            });
            return response;
        }).collect(Collectors.toList());
    }
}
