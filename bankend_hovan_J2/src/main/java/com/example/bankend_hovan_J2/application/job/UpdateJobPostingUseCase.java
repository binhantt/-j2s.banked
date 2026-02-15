package com.example.bankend_hovan_J2.application.job;

import com.example.bankend_hovan_J2.domain.job.entity.JobPosting;
import com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateJobPostingUseCase {
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public JobPosting execute(Long id, JobPosting jobPosting) {
        JobPosting existing = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));

        // Update fields
        existing.setTitle(jobPosting.getTitle());
        existing.setDescription(jobPosting.getDescription());
        existing.setRequirements(jobPosting.getRequirements());
        existing.setLocation(jobPosting.getLocation());
        existing.setSalaryMin(jobPosting.getSalaryMin());
        existing.setSalaryMax(jobPosting.getSalaryMax());
        existing.setJobType(jobPosting.getJobType());
        existing.setLevel(jobPosting.getLevel());
        existing.setExperience(jobPosting.getExperience());
        existing.setStatus(jobPosting.getStatus());

        return jobPostingRepository.save(existing);
    }
}
