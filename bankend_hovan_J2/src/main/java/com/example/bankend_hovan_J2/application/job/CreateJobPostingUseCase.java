package com.example.bankend_hovan_J2.application.job;

import com.example.bankend_hovan_J2.domain.job.entity.JobPosting;
import com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateJobPostingUseCase {
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public JobPosting execute(JobPosting jobPosting) {
        // Business logic: Set default status if not provided
        if (jobPosting.getStatus() == null || jobPosting.getStatus().isEmpty()) {
            jobPosting.setStatus("active");
        }

        return jobPostingRepository.save(jobPosting);
    }
}
