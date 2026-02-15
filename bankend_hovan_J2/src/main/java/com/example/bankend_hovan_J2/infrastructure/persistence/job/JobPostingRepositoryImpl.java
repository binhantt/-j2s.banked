package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import com.example.bankend_hovan_J2.domain.job.entity.JobPosting;
import com.example.bankend_hovan_J2.domain.job.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JobPostingRepositoryImpl implements JobPostingRepository {

    private final JobPostingJpaRepository jpaRepository;

    @Override
    public JobPosting save(JobPosting jobPosting) {
        JobPostingEntityJpa entity = toEntity(jobPosting);
        JobPostingEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<JobPosting> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<JobPosting> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobPosting> findByStatus(String status) {
        return jpaRepository.findByStatus(status).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobPosting> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private JobPostingEntityJpa toEntity(JobPosting domain) {
        JobPostingEntityJpa entity = new JobPostingEntityJpa();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setTitle(domain.getTitle());
        entity.setLocation(domain.getLocation());
        entity.setSalaryMin(domain.getSalaryMin());
        entity.setSalaryMax(domain.getSalaryMax());
        entity.setJobType(domain.getJobType());
        entity.setLevel(domain.getLevel());
        entity.setExperience(domain.getExperience());
        entity.setDescription(domain.getDescription());
        entity.setRequirements(domain.getRequirements());
        entity.setBenefits(domain.getBenefits());
        entity.setDeadline(domain.getDeadline());
        entity.setStatus(domain.getStatus());
        entity.setApplications(domain.getApplications());
        entity.setViews(domain.getViews());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        return entity;
    }

    private JobPosting toDomain(JobPostingEntityJpa entity) {
        JobPosting domain = new JobPosting();
        domain.setId(entity.getId());
        domain.setUserId(entity.getUserId());
        domain.setTitle(entity.getTitle());
        domain.setLocation(entity.getLocation());
        domain.setSalaryMin(entity.getSalaryMin());
        domain.setSalaryMax(entity.getSalaryMax());
        domain.setJobType(entity.getJobType());
        domain.setLevel(entity.getLevel());
        domain.setExperience(entity.getExperience());
        domain.setDescription(entity.getDescription());
        domain.setRequirements(entity.getRequirements());
        domain.setBenefits(entity.getBenefits());
        domain.setDeadline(entity.getDeadline());
        domain.setStatus(entity.getStatus());
        domain.setApplications(entity.getApplications());
        domain.setViews(entity.getViews());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        return domain;
    }
}
