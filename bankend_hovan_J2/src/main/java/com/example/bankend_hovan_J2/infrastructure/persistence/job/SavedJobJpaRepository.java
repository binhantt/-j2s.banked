package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobJpaRepository extends JpaRepository<SavedJobEntityJpa, Long> {
    List<SavedJobEntityJpa> findByUserId(Long userId);
    Optional<SavedJobEntityJpa> findByUserIdAndJobId(Long userId, Long jobId);
    void deleteByUserIdAndJobId(Long userId, Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}
