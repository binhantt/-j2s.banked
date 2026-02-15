package com.example.bankend_hovan_J2.infrastructure.persistence.savedjob;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobJpaRepository extends JpaRepository<SavedJobEntityJpa, Long> {
    Optional<SavedJobEntityJpa> findByUserIdAndJobPostingId(Long userId, Long jobPostingId);
    List<SavedJobEntityJpa> findByUserId(Long userId);
    void deleteByUserIdAndJobPostingId(Long userId, Long jobPostingId);
}
