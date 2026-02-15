package com.example.bankend_hovan_J2.application.profile;

import com.example.bankend_hovan_J2.domain.profile.entity.JobSeekerProfile;
import com.example.bankend_hovan_J2.domain.profile.repository.JobSeekerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateJobSeekerProfileUseCase {
    private final JobSeekerProfileRepository jobSeekerProfileRepository;

    @Transactional
    public JobSeekerProfile execute(JobSeekerProfile profile) {
        // Business logic: Check if user already has profile
        jobSeekerProfileRepository.findByUserId(profile.getUserId())
                .ifPresent(existing -> {
                    throw new RuntimeException("User already has job seeker profile");
                });

        return jobSeekerProfileRepository.save(profile);
    }
}
