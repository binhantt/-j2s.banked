package com.example.bankend_hovan_J2.infrastructure.persistence.savedjob;

import com.example.bankend_hovan_J2.domain.savedjob.entity.SavedJob;
import com.example.bankend_hovan_J2.domain.savedjob.repository.SavedJobRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class SavedJobRepositoryImpl implements SavedJobRepository {
    
    private final SavedJobJpaRepository jpaRepository;

    public SavedJobRepositoryImpl(SavedJobJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public SavedJob save(SavedJob savedJob) {
        SavedJobEntityJpa entity = toEntity(savedJob);
        SavedJobEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<SavedJob> findByUserIdAndJobPostingId(Long userId, Long jobPostingId) {
        return jpaRepository.findByUserIdAndJobPostingId(userId, jobPostingId)
                .map(this::toDomain);
    }

    @Override
    public List<SavedJob> findByUserId(Long userId) {
        return jpaRepository.findByUserId(userId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByUserIdAndJobPostingId(Long userId, Long jobPostingId) {
        jpaRepository.deleteByUserIdAndJobPostingId(userId, jobPostingId);
    }

    private SavedJobEntityJpa toEntity(SavedJob domain) {
        SavedJobEntityJpa entity = new SavedJobEntityJpa();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setJobPostingId(domain.getJobPostingId());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }

    private SavedJob toDomain(SavedJobEntityJpa entity) {
        SavedJob domain = new SavedJob();
        domain.setId(entity.getId());
        domain.setUserId(entity.getUserId());
        domain.setJobPostingId(entity.getJobPostingId());
        domain.setCreatedAt(entity.getCreatedAt());
        return domain;
    }
}
