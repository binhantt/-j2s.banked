package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMilestoneJpaRepository extends JpaRepository<ProjectMilestoneEntityJpa, Long> {
    List<ProjectMilestoneEntityJpa> findByProjectIdOrderByDueDateAsc(Long projectId);
    void deleteByProjectId(Long projectId);
}
