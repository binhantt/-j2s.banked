package com.example.bankend_hovan_J2.domain.freelance.repository;

import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectMilestone;

import java.util.List;
import java.util.Optional;

public interface ProjectMilestoneRepository {
    ProjectMilestone save(ProjectMilestone milestone);
    Optional<ProjectMilestone> findById(Long id);
    List<ProjectMilestone> findByProjectId(Long projectId);
    void deleteById(Long id);
    void deleteByProjectId(Long projectId);
}
