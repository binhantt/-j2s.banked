package com.example.bankend_hovan_J2.application.application;

import com.example.bankend_hovan_J2.domain.application.entity.JobApplication;
import com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplyJobUseCase {
    
    private final JobApplicationRepository applicationRepository;

    public ApplyJobUseCase(JobApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public JobApplication execute(Long jobPostingId, Long userId, String cvUrl, String coverLetter) {
        // Check if already applied
        if (applicationRepository.findByJobPostingIdAndUserId(jobPostingId, userId).isPresent()) {
            throw new RuntimeException("Already applied to this job");
        }

        JobApplication application = new JobApplication(jobPostingId, userId, cvUrl, coverLetter);
        return applicationRepository.save(application);
    }
}
