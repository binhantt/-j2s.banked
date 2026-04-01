package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface JobPostingJpaRepository extends JpaRepository<JobPostingEntityJpa, Long> {
    
    @Query("SELECT j FROM JobPostingEntityJpa j WHERE j.userId = :userId AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true)")
    List<JobPostingEntityJpa> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT j FROM JobPostingEntityJpa j WHERE j.status = :status AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true)")
    List<JobPostingEntityJpa> findByStatus(@Param("status") String status);
    
    @Query("SELECT j FROM JobPostingEntityJpa j WHERE j.userId = :userId AND j.status = :status AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true)")
    List<JobPostingEntityJpa> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("SELECT j FROM JobPostingEntityJpa j WHERE EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true)")
    List<JobPostingEntityJpa> findAllActive();

    @Query("SELECT j FROM JobPostingEntityJpa j WHERE j.id = :id AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true)")
    java.util.Optional<JobPostingEntityJpa> findActiveById(@Param("id") Long id);

    @Query("SELECT COUNT(j) FROM JobPostingEntityJpa j WHERE j.status = 'active' AND EXISTS (SELECT c FROM CompanyEntityJpa c WHERE c.hrId = j.userId AND c.domainId = :domainId) AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true)")
    long countActiveJobsByDomainId(@Param("domainId") Long domainId);

    @Query("SELECT DISTINCT j.location FROM JobPostingEntityJpa j WHERE j.status = 'active' AND j.location IS NOT NULL AND j.location <> '' ORDER BY j.location")
    List<String> findDistinctActiveLocations();

    @Query("SELECT DISTINCT j.experience FROM JobPostingEntityJpa j WHERE j.status = 'active' AND j.experience IS NOT NULL AND j.experience <> '' ORDER BY j.experience")
    List<String> findDistinctActiveExperiences();

    // Search jobs with all filters at DB level - properly handles salary ranges
    // Logic: Keep job if job's salary range OVERLAPS with search salary range
    // - salaryMin filter: keep jobs where salaryMax >= salaryMin (job can pay at least that much)
    // - salaryMax filter: keep jobs where salaryMin <= salaryMax (job starts at or below that amount)
    // Experience: filter by experienceYearsMin (INT) range
    @Query("SELECT j FROM JobPostingEntityJpa j WHERE j.status = 'active' " +
           "AND EXISTS (SELECT u FROM UserEntityJpa u WHERE u.id = j.userId AND u.isActive = true) " +
           "AND (:searchText IS NULL OR :searchText = '' OR " +
           "     LOWER(j.title) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "     LOWER(j.description) LIKE LOWER(CONCAT('%', :searchText, '%'))) " +
           "AND (:location IS NULL OR :location = '' OR :location = 'all' OR " +
           "     LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:jobType IS NULL OR :jobType = '' OR j.jobType = :jobType) " +
           "AND (:salaryMin IS NULL OR j.salaryMax IS NULL OR j.salaryMax >= :salaryMin) " +
           "AND (:salaryMax IS NULL OR j.salaryMin IS NULL OR j.salaryMin <= :salaryMax) " +
           "AND (:experienceMin IS NULL OR j.experienceYearsMin IS NULL OR j.experienceYearsMin >= :experienceMin) " +
           "AND (:experienceMax IS NULL OR j.experienceYearsMin IS NULL OR j.experienceYearsMin <= :experienceMax)")
    List<JobPostingEntityJpa> searchJobs(
            @Param("searchText") String searchText,
            @Param("location") String location,
            @Param("jobType") String jobType,
            @Param("salaryMin") Long salaryMin,
            @Param("salaryMax") Long salaryMax,
            @Param("experienceMin") Integer experienceMin,
            @Param("experienceMax") Integer experienceMax
    );
}
