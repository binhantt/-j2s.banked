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
}
