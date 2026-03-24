# Controller — Danh sách & Tìm kiếm công việc

## Controller
```java
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostingController {
    private final JobPostingJpaRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<List<JobPostingResponse>> getAllJobs() {
        List<JobPostingEntityJpa> jobs = jobPostingRepository.findAll();
        return ResponseEntity.ok(enrichWithCompanyName(jobs));
    }

    @GetMapping("/active")
    public ResponseEntity<List<JobPostingResponse>> getActiveJobs() {
        List<JobPostingEntityJpa> jobs = jobPostingRepository.findByStatus("active");
        return ResponseEntity.ok(enrichWithCompanyName(jobs));
    }

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
                    if (searchText != null && !searchText.trim().isEmpty()) {
                        String lower = searchText.toLowerCase();
                        boolean matches = (job.getTitle() != null && job.getTitle().toLowerCase().contains(lower))
                                || (job.getDescription() != null && job.getDescription().toLowerCase().contains(lower));
                        if (!matches) {
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
                    if (location != null && !location.trim().isEmpty() && !location.equalsIgnoreCase("all")) {
                        if (job.getLocation() == null || !job.getLocation().toLowerCase().contains(location.toLowerCase())) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(job -> {
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
                    if (salaryMin != null) {
                        if (job.getSalaryMin() == null || job.getSalaryMin() < salaryMin) return false;
                    }
                    if (salaryMax != null) {
                        if (job.getSalaryMax() == null || job.getSalaryMax() > salaryMax) return false;
                    }
                    return true;
                })
                .filter(job -> {
                    if (experience != null && !experience.trim().isEmpty() && !experience.equalsIgnoreCase("all")) {
                        if (job.getExperience() == null || !job.getExperience().equalsIgnoreCase(experience.trim())) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<JobPostingEntityJpa> paged = start < filtered.size() ? filtered.subList(start, end) : List.of();

        return ResponseEntity.ok(enrichWithCompanyName(paged));
    }

    private List<JobPostingResponse> enrichWithCompanyName(List<JobPostingEntityJpa> jobs) {
        return jobs.stream().map(job -> {
            JobPostingResponse response = JobPostingResponse.fromEntity(job);
            companyRepository.findByHrIdIncludingInactive(job.getUserId()).ifPresent(company -> {
                response.setCompanyName(company.getName());
                response.setCompanyId(company.getId());
                response.setCompanyLogoUrl(company.getLogoUrl());
            });
            return response;
        }).collect(Collectors.toList());
    }
}
```

## Endpoints tìm kiếm
| Method | Endpoint | Params |
|--------|----------|--------|
| GET | `/api/jobs` | — |
| GET | `/api/jobs/active` | — |
| GET | `/api/jobs/search` | searchText, location, jobType, salaryMin, salaryMax, experience, page, size, sortBy, sortDir |
| GET | `/api/jobs/user/{userId}` | — |
| GET | `/api/jobs/locations` | — |
| GET | `/api/jobs/experiences` | — |
