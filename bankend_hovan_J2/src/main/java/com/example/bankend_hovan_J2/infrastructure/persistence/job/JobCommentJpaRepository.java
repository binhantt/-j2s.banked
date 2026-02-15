package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobCommentJpaRepository extends JpaRepository<JobCommentEntityJpa, Long> {
    List<JobCommentEntityJpa> findByJobPostingIdOrderByCreatedAtDesc(Long jobPostingId);
}
