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

    // Search jobs with filters (server-side)
    @GetMapping("/search")
    public ResponseEntity<List<JobPostingResponse>> searchJobs(
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) Long salaryMin,
            @RequestParam(required = false) Long salaryMax,
            @RequestParam(required = false) String experience,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        List<JobPostingEntityJpa> allActive = jobPostingRepository.findByStatus("active");

        List<JobPostingEntityJpa> filtered = allActive.stream()
                .filter(job -> {
                    // Filter by search text (title, description, company name)
                    if (searchText != null && !searchText.trim().isEmpty()) {
                        String lower = searchText.toLowerCase();
                        boolean matches = (job.getTitle() != null && job.getTitle().toLowerCase().contains(lower))
                                || (job.getDescription() != null && job.getDescription().toLowerCase().contains(lower));
                        if (!matches) {
                            // Also check company name
                            var company = companyRepository.findByHrIdIncludingInactive(job.getUserId());
                            if (company.isEmpty() || company.get().getName() == null
                                    || !company.get().getName().toLowerCase().contains(lower)) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
                .filter(job -> {
                    // Filter by location
                    if (location != null && !location.trim().isEmpty() && !location.equalsIgnoreCase("all")) {
                        if (job.getLocation() == null || !job.getLocation().toLowerCase().contains(location.toLowerCase())) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(job -> {
                    // Filter by job type (comma-separated list)
                    if (jobType != null && !jobType.trim().isEmpty()) {
                        String[] types = jobType.split(",");
                        boolean matches = false;
                        for (String t : types) {
                            if (job.getJobType() != null && job.getJobType().equalsIgnoreCase(t.trim())) {
                                matches = true;
                                break;
                            }
                        }
                        if (!matches) return false;
                    }
                    return true;
                })
                .filter(job -> {
                    // Filter by salary range
                    if (salaryMin != null) {
                        if (job.getSalaryMin() == null || job.getSalaryMin() < salaryMin) {
                            return false;
                        }
                    }
                    if (salaryMax != null) {
                        if (job.getSalaryMax() == null || job.getSalaryMax() > salaryMax) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(job -> {
                    // Filter by experience level
                    if (experience != null && !experience.trim().isEmpty() && !experience.equalsIgnoreCase("all")) {
                        if (job.getExperience() == null || !job.getExperience().equalsIgnoreCase(experience.trim())) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Apply pagination manually (since we're already in memory for these queries)
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<JobPostingEntityJpa> paged = start < filtered.size()
                ? filtered.subList(start, end)
                : List.of();

        return ResponseEntity.ok(enrichWithCompanyName(paged));
    }

    // Get unique locations from active jobs
    @GetMapping("/locations")
    public ResponseEntity<List<String>> getActiveLocations() {
        return ResponseEntity.ok(jobPostingRepository.findDistinctActiveLocations());
    }

    // Get unique experience levels from active jobs
    @GetMapping("/experiences")
    public ResponseEntity<List<String>> getActiveExperiences() {
        return ResponseEntity.ok(jobPostingRepository.findDistinctActiveExperiences());
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
