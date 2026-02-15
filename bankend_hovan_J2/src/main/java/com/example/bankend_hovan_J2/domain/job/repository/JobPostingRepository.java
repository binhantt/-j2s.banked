package com.example.bankend_hovan_J2.domain.job.repository;

import com.example.bankend_hovan_J2.domain.job.entity.JobPosting;

import java.util.List;
import java.util.Optional;

public interface JobPostingRepository {
    JobPosting save(JobPosting jobPosting);
    Optional<JobPosting> findById(Long id);
    List<JobPosting> findAll();
    List<JobPosting> findByStatus(String status);
    List<JobPosting> findByUserId(Long userId);
    void deleteById(Long id);
}
