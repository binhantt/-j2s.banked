package com.example.bankend_hovan_J2.domain.job.repository;

import com.example.bankend_hovan_J2.domain.job.entity.JobComment;

import java.util.List;
import java.util.Optional;

public interface JobCommentRepository {
    JobComment save(JobComment comment);
    Optional<JobComment> findById(Long id);
    List<JobComment> findByJobPostingId(Long jobPostingId);
    void deleteById(Long id);
}
