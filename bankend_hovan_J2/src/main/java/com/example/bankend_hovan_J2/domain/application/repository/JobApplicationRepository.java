package com.example.bankend_hovan_J2.domain.application.repository;

import com.example.bankend_hovan_J2.domain.application.entity.JobApplication;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository {
    JobApplication save(JobApplication application);
    Optional<JobApplication> findById(Long id);
    List<JobApplication> findByJobPostingId(Long jobPostingId);
    List<JobApplication> findByUserId(Long userId);
    Optional<JobApplication> findByJobPostingIdAndUserId(Long jobPostingId, Long userId);
    Long countByJobPostingId(Long jobPostingId);
    void deleteById(Long id);
}
