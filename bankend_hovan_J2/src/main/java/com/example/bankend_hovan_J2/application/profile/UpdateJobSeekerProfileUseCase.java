package com.example.bankend_hovan_J2.application.profile;

import com.example.bankend_hovan_J2.domain.profile.entity.JobSeekerProfile;
import com.example.bankend_hovan_J2.domain.profile.repository.JobSeekerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UpdateJobSeekerProfileUseCase {
    private final JobSeekerProfileRepository jobSeekerProfileRepository;

    @Transactional
    public JobSeekerProfile execute(Long id, JobSeekerProfile profile) {
        JobSeekerProfile existing = jobSeekerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job seeker profile not found"));

        // Update fields
        existing.setPhone(profile.getPhone());
        existing.setLocation(profile.getLocation());
        existing.setBio(profile.getBio());

        return jobSeekerProfileRepository.save(existing);
    }
}
