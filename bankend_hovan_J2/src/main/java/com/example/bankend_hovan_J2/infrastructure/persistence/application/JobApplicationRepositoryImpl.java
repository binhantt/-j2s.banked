package com.example.bankend_hovan_J2.infrastructure.persistence.application;

import com.example.bankend_hovan_J2.domain.application.entity.JobApplication;
import com.example.bankend_hovan_J2.domain.application.repository.JobApplicationRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JobApplicationRepositoryImpl implements JobApplicationRepository {
    
    private final JobApplicationJpaRepository jpaRepository;

    public JobApplicationRepositoryImpl(JobApplicationJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public JobApplication save(JobApplication application) {
        JobApplicationEntityJpa entity = toEntity(application);
        JobApplicationEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<JobApplication> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<JobApplication> findByJobPostingId(Long jobPostingId) {
        return jpaRepository.findByJobPostingId(jobPostingId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobApplication> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<JobApplication> findByJobPostingIdAndUserId(Long jobPostingId, Long userId) {
        return jpaRepository.findByJobPostingIdAndUserId(jobPostingId, userId)
                .map(this::toDomain);
    }

    @Override
    public Long countByJobPostingId(Long jobPostingId) {
        return jpaRepository.countByJobPostingId(jobPostingId);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    // Mapping methods
    private JobApplicationEntityJpa toEntity(JobApplication domain) {
        JobApplicationEntityJpa entity = new JobApplicationEntityJpa();
        entity.setId(domain.getId());
        entity.setJobPostingId(domain.getJobPostingId());
        entity.setUserId(domain.getUserId());
        entity.setCvUrl(domain.getCvUrl());
        entity.setCoverLetter(domain.getCoverLetter());
        entity.setStatus(domain.getStatus());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        return entity;
    }

    private JobApplication toDomain(JobApplicationEntityJpa entity) {
        JobApplication domain = new JobApplication();
        domain.setId(entity.getId());
        domain.setJobPostingId(entity.getJobPostingId());
        domain.setUserId(entity.getUserId());
        domain.setCvUrl(entity.getCvUrl());
        domain.setCoverLetter(entity.getCoverLetter());
        domain.setStatus(entity.getStatus());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        return domain;
    }
}
