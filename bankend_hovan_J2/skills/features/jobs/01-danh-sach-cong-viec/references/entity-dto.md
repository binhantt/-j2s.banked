# Entity + Response References — Jobs

## JobPostingEntityJpa
```java
// infrastructure/persistence/job/JobPostingEntityJpa.java
@Entity @Table(name = "job_postings")
public class JobPostingEntityJpa {
    private Long id;
    private Long userId;              // HR user ID
    private String title;
    private String location;
    private Long salaryMin;           // VND
    private Long salaryMax;          // VND
    private String jobType;          // full-time, part-time, freelance, internship
    private String level;            // fresher, junior, mid, senior, lead
    private String experience;       // "0-1 years", "1-3 years", "3-5 years", "5+ years"
    private String description;      // TEXT
    private String requirements;     // TEXT
    private String benefits;         // TEXT
    private LocalDate deadline;
    private String status;           // active, inactive, closed
    private Integer applications;    // default 0
    private Integer maxApplicants;   // null = unlimited
    private Integer interviewRounds;  // default 1
    private Integer views;           // default 0
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## JobPostingResponse
```java
// presentation/job/JobPostingResponse.java
@Data @Builder
public class JobPostingResponse {
    private Long id;
    private Long userId;
    private String title;
    private String location;
    private Long salaryMin;
    private Long salaryMax;
    private String jobType;
    private String level;
    private String experience;
    private String description;
    private String requirements;
    private String benefits;
    private LocalDate deadline;
    private String status;
    private Integer applications;
    private Integer maxApplicants;
    private Integer interviewRounds;
    private Integer views;
    private LocalDateTime createdAt;
    // Enriched fields
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
}
```

## JobPostingJpaRepository
```java
// infrastructure/persistence/job/JobPostingJpaRepository.java
@Repository
public interface JobPostingJpaRepository extends JpaRepository<JobPostingEntityJpa, Long> {
    List<JobPostingEntityJpa> findByStatus(String status);
    List<JobPostingEntityJpa> findByUserId(Long userId);
    List<String> findDistinctActiveLocations();
    List<String> findDistinctActiveExperiences();
}
```
