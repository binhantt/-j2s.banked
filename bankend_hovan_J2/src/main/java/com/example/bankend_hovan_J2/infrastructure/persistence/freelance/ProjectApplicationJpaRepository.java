package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectApplicationJpaRepository extends JpaRepository<ProjectApplicationEntityJpa, Long> {
    List<ProjectApplicationEntityJpa> findByProjectId(Long projectId);
    List<ProjectApplicationEntityJpa> findByFreelancerId(Long freelancerId);
    Optional<ProjectApplicationEntityJpa> findByProjectIdAndFreelancerId(Long projectId, Long freelancerId);
    long countByProjectId(Long projectId);
}
