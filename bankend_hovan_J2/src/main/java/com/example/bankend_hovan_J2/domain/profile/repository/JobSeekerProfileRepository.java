package com.example.bankend_hovan_J2.domain.profile.repository;

import com.example.bankend_hovan_J2.domain.profile.entity.JobSeekerProfile;

import java.util.Optional;

public interface JobSeekerProfileRepository {
    JobSeekerProfile save(JobSeekerProfile profile);
    Optional<JobSeekerProfile> findById(Long id);
    Optional<JobSeekerProfile> findByUserId(Long userId);
    void deleteById(Long id);
}
