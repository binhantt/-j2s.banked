package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectApplication;
import com.example.bankend_hovan_J2.domain.freelance.repository.ProjectApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProjectApplicationRepositoryImpl implements ProjectApplicationRepository {
    private final ProjectApplicationJpaRepository jpaRepository;

    @Override
    public ProjectApplication save(ProjectApplication application) {
        ProjectApplicationEntityJpa entity = toEntity(application);
        ProjectApplicationEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ProjectApplication> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<ProjectApplication> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectId(projectId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectApplication> findByFreelancerId(Long freelancerId) {
        return jpaRepository.findByFreelancerId(freelancerId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProjectApplication> findByProjectIdAndFreelancerId(Long projectId, Long freelancerId) {
        return jpaRepository.findByProjectIdAndFreelancerId(projectId, freelancerId)
                .map(this::toDomain);
    }

    @Override
    public long countByProjectId(Long projectId) {
        return jpaRepository.countByProjectId(projectId);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private ProjectApplicationEntityJpa toEntity(ProjectApplication application) {
        return ProjectApplicationEntityJpa.builder()
                .id(application.getId())
                .projectId(application.getProjectId())
                .freelancerId(application.getFreelancerId())
                .status(application.getStatus())
                .coverLetter(application.getCoverLetter())
                .proposedPrice(application.getProposedPrice())
                .estimatedDuration(application.getEstimatedDuration())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }

    private ProjectApplication toDomain(ProjectApplicationEntityJpa entity) {
        return ProjectApplication.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .freelancerId(entity.getFreelancerId())
                .status(entity.getStatus())
                .coverLetter(entity.getCoverLetter())
                .proposedPrice(entity.getProposedPrice())
                .estimatedDuration(entity.getEstimatedDuration())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
