package com.example.bankend_hovan_J2.presentation.job;

import com.example.bankend_hovan_J2.domain.company.repository.CompanyRepository;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingEntityJpa;
import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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

    // Search jobs with filters (DB-level query)
    @GetMapping("/search")
    public ResponseEntity<List<JobPostingResponse>> searchJobs(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) Long salaryMin,
            @RequestParam(required = false) Long salaryMax,
            @RequestParam(required = false) Integer experienceMin,
            @RequestParam(required = false) Integer experienceMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Pageable pageable = PageRequest.of(page, size);

        // Query at DB level - salary logic:
        // - salaryMin: keep jobs where salaryMax >= salaryMin (job can pay at least that much)
        // - salaryMax: keep jobs where salaryMin <= salaryMax (job starts at or below that amount)
        // - Jobs with NULL salary fields are included (treat NULL as "negotiable")
        // Experience: filter by experienceYearsMin (INT) range
        List<JobPostingEntityJpa> results = jobPostingRepository.searchJobs(
                searchText,
                location,
                jobType,
                salaryMin,
                salaryMax,
                experienceMin,
                experienceMax
        );

        // Apply sorting in memory (JPQL doesn't support dynamic sort column easily)
        List<JobPostingEntityJpa> sorted = results.stream()
                .sorted((a, b) -> {
                    int cmp = 0;
                    switch (sortBy.toLowerCase()) {
                        case "salarymin":
                            Long aMin = a.getSalaryMin() != null ? a.getSalaryMin() : 0L;
                            Long bMin = b.getSalaryMin() != null ? b.getSalaryMin() : 0L;
                            cmp = aMin.compareTo(bMin);
                            break;
                        case "title":
                            String aTitle = a.getTitle() != null ? a.getTitle() : "";
                            String bTitle = b.getTitle() != null ? b.getTitle() : "";
                            cmp = aTitle.compareToIgnoreCase(bTitle);
                            break;
                        case "views":
                            cmp = a.getViews().compareTo(b.getViews());
                            break;
                        case "experienceyearsmin":
                            Integer aExp = a.getExperienceYearsMin() != null ? a.getExperienceYearsMin() : 0;
                            Integer bExp = b.getExperienceYearsMin() != null ? b.getExperienceYearsMin() : 0;
                            cmp = aExp.compareTo(bExp);
                            break;
                        case "createdat":
                        default:
                            cmp = a.getCreatedAt().compareTo(b.getCreatedAt());
                            break;
                    }
                    return "asc".equalsIgnoreCase(sortDir) ? cmp : -cmp;
                })
                .collect(Collectors.toList());

        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sorted.size());
        List<JobPostingEntityJpa> paged = start < sorted.size()
                ? sorted.subList(start, end)
                : List.of();

        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(results.size()))
                .body(enrichWithCompanyName(paged));
    }

    // Get unique locations from active jobs
    @GetMapping("/locations")
    public ResponseEntity<List<String>> getActiveLocations() {
        return ResponseEntity.ok(jobPostingRepository.findDistinctActiveLocations());
    }

    // Get unique experience levels from active jobs (legacy String field)
    @GetMapping("/experiences")
    public ResponseEntity<List<String>> getActiveExperiences() {
        return ResponseEntity.ok(jobPostingRepository.findDistinctActiveExperiences());
    }

    // Get predefined experience options (for dropdown)
    @GetMapping("/experience-options")
    public ResponseEntity<List<java.util.Map<String, Object>>> getExperienceOptions() {
        List<java.util.Map<String, Object>> options = java.util.Arrays.asList(
            java.util.Map.of("value", 0, "label", "Không yêu cầu"),
            java.util.Map.of("value", 1, "label", "1 năm"),
            java.util.Map.of("value", 2, "label", "2 năm"),
            java.util.Map.of("value", 3, "label", "3 năm"),
            java.util.Map.of("value", 5, "label", "5 năm"),
            java.util.Map.of("value", 7, "label", "7+ năm")
        );
        return ResponseEntity.ok(options);
    }

    // Get job postings by user (HR)
    @GetMapping("/user/{userId:[0-9]+}")
    public ResponseEntity<List<JobPostingResponse>> getJobsByUser(@PathVariable Long userId) {
        List<JobPostingEntityJpa> jobs = jobPostingRepository.findByUserId(userId);
        return ResponseEntity.ok(enrichWithCompanyName(jobs));
    }

    // Get single job posting
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<JobPostingResponse> getJob(@PathVariable Long id) {
        return jobPostingRepository.findById(id)
                .map(job -> {
                    JobPostingResponse response = JobPostingResponse.fromEntity(job);
                    // Add company name and logo
                    companyRepository.findByHrIdIncludingInactive(job.getUserId()).ifPresent(company -> {
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
                    existing.setExperienceYearsMin(job.getExperienceYearsMin());
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

    // Toggle job status (active/inactive)
    @PutMapping("/{id:[0-9]+}/toggle-status")
    public ResponseEntity<JobPostingEntityJpa> toggleStatus(@PathVariable Long id) {
        return jobPostingRepository.findById(id)
                .map(job -> {
                    job.setStatus(job.getStatus().equals("active") ? "inactive" : "active");
                    return ResponseEntity.ok(jobPostingRepository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Increment views
    @PutMapping("/{id:[0-9]+}/view")
    public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
        jobPostingRepository.findById(id).ifPresent(job -> {
            job.setViews(job.getViews() + 1);
            jobPostingRepository.save(job);
        });
        return ResponseEntity.ok().build();
    }

    // Delete job posting
    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobPostingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    // Helper method to enrich jobs with company name
    private List<JobPostingResponse> enrichWithCompanyName(List<JobPostingEntityJpa> jobs) {
        return jobs.stream().map(job -> {
            JobPostingResponse response = JobPostingResponse.fromEntity(job);
            // Add company name and logo
            companyRepository.findByHrIdIncludingInactive(job.getUserId()).ifPresent(company -> {
                response.setCompanyName(company.getName());
                response.setCompanyId(company.getId());
                response.setCompanyLogoUrl(company.getLogoUrl());
            });
            return response;
        }).collect(Collectors.toList());
    }
}
