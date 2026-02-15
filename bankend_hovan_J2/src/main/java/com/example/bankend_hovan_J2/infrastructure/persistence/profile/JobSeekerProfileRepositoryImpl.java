package com.example.bankend_hovan_J2.infrastructure.persistence.profile;

import com.example.bankend_hovan_J2.domain.profile.entity.JobSeekerProfile;
import com.example.bankend_hovan_J2.domain.profile.repository.JobSeekerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JobSeekerProfileRepositoryImpl implements JobSeekerProfileRepository {

    private final JobSeekerProfileJpaRepository jpaRepository;

    @Override
    public JobSeekerProfile save(JobSeekerProfile profile) {
        JobSeekerProfileEntityJpa entity = toEntity(profile);
        JobSeekerProfileEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<JobSeekerProfile> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<JobSeekerProfile> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private JobSeekerProfileEntityJpa toEntity(JobSeekerProfile domain) {
        JobSeekerProfileEntityJpa entity = new JobSeekerProfileEntityJpa();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setPhone(domain.getPhone());
        entity.setLocation(domain.getLocation());
        entity.setBio(domain.getBio());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        return entity;
    }

    private JobSeekerProfile toDomain(JobSeekerProfileEntityJpa entity) {
        JobSeekerProfile domain = new JobSeekerProfile();
        domain.setId(entity.getId());
        domain.setUserId(entity.getUserId());
        domain.setPhone(entity.getPhone());
        domain.setLocation(entity.getLocation());
        domain.setBio(entity.getBio());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        return domain;
    }
}
