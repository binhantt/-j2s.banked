package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingJpaRepository extends JpaRepository<JobPostingEntityJpa, Long> {
    List<JobPostingEntityJpa> findByUserId(Long userId);
    List<JobPostingEntityJpa> findByStatus(String status);
    List<JobPostingEntityJpa> findByUserIdAndStatus(Long userId, String status);
}
