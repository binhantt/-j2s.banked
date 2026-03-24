# Entity References — Applications

## JobApplicationEntityJpa
```java
// infrastructure/persistence/application/JobApplicationEntityJpa.java
@Entity @Table(name = "job_applications")
public class JobApplicationEntityJpa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_posting_id", nullable = false)
    private Long jobPostingId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "cv_url")
    private String cvUrl;       // URL CV đã upload

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "status")
    private String status = "pending"; // pending, reviewing, accepted, rejected

    @Column(name = "user_confirmed")
    private Boolean userConfirmed = false; // Ứng viên xác nhận đi làm

    @Column(name = "current_round")
    private Integer currentRound = 0; // Vòng phỏng vấn hiện tại

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

## Status Flow
```
pending → reviewing → accepted
                    → rejected
```

## Round Logic
- currentRound < interviewRounds → có thể pass/fail
- pass → currentRound + 1, status = "reviewing"
- fail → status = "rejected"
- currentRound >= interviewRounds → đã hoàn thành tất cả vòng

## JobApplicationJpaRepository
```java
// infrastructure/persistence/application/JobApplicationJpaRepository.java
@Repository
public interface JobApplicationJpaRepository extends JpaRepository<JobApplicationEntityJpa, Long> {
    List<JobApplicationEntityJpa> findByJobPostingId(Long jobPostingId);
    List<JobApplicationEntityJpa> findByUserId(Long userId);
    Optional<JobApplicationEntityJpa> findByJobPostingIdAndUserId(Long jobPostingId, Long userId);
}
```
