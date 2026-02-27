package com.example.bankend_hovan_J2.domain.freelance.repository;

import com.example.bankend_hovan_J2.domain.freelance.entity.ProjectApplication;

import java.util.List;
import java.util.Optional;

public interface ProjectApplicationRepository {
    ProjectApplication save(ProjectApplication application);
    Optional<ProjectApplication> findById(Long id);
    List<ProjectApplication> findByProjectId(Long projectId);
    List<ProjectApplication> findByFreelancerId(Long freelancerId);
    Optional<ProjectApplication> findByProjectIdAndFreelancerId(Long projectId, Long freelancerId);
    long countByProjectId(Long projectId);
    void deleteById(Long id);
}
