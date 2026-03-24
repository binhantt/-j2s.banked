package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationJpaRepository extends JpaRepository<ConversationEntityJpa, Long> {
    Optional<ConversationEntityJpa> findByHrIdAndJobSeekerIdAndJobPostingId(Long hrId, Long jobSeekerId, Long jobPostingId);
    List<ConversationEntityJpa> findByHrId(Long hrId);
    List<ConversationEntityJpa> findByJobSeekerId(Long jobSeekerId);
    Page<ConversationEntityJpa> findByHrId(Long hrId, Pageable pageable);
    Page<ConversationEntityJpa> findByJobSeekerId(Long jobSeekerId, Pageable pageable);
    Page<ConversationEntityJpa> findAllByOrderByUpdatedAtDesc(Pageable pageable);
}
