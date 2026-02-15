package com.example.bankend_hovan_J2.application.job;

import com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeleteJobPostingUseCase {
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public void execute(Long id) {
        // Business logic: Check if job exists before deleting
        jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));

        jobPostingRepository.deleteById(id);
    }
}
