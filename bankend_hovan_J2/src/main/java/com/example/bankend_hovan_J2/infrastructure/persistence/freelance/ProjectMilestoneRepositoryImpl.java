package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectMilestone;
import com.example.bankend_hovan_J2.domain.freelance.repository.ProjectMilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProjectMilestoneRepositoryImpl implements ProjectMilestoneRepository {
    private final ProjectMilestoneJpaRepository jpaRepository;

    @Override
    public ProjectMilestone save(ProjectMilestone milestone) {
        ProjectMilestoneEntityJpa entity = toEntity(milestone);
        ProjectMilestoneEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ProjectMilestone> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<ProjectMilestone> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectIdOrderByDueDateAsc(projectId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByProjectId(Long projectId) {
        jpaRepository.deleteByProjectId(projectId);
    }

    private ProjectMilestoneEntityJpa toEntity(ProjectMilestone milestone) {
        return ProjectMilestoneEntityJpa.builder()
                .id(milestone.getId())
                .projectId(milestone.getProjectId())
                .title(milestone.getTitle())
                .percentage(milestone.getPercentage())
                .status(milestone.getStatus())
                .dueDate(milestone.getDueDate())
                .createdAt(milestone.getCreatedAt())
                .updatedAt(milestone.getUpdatedAt())
                .build();
    }

    private ProjectMilestone toDomain(ProjectMilestoneEntityJpa entity) {
        return ProjectMilestone.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .title(entity.getTitle())
                .percentage(entity.getPercentage())
                .status(entity.getStatus())
                .dueDate(entity.getDueDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
