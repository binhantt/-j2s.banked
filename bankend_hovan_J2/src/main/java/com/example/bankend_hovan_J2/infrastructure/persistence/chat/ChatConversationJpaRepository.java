package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationJpaRepository extends JpaRepository<ChatConversationEntityJpa, Long> {
    List<ChatConversationEntityJpa> findByJobSeekerId(Long jobSeekerId);
    List<ChatConversationEntityJpa> findByHrId(Long hrId);
    Optional<ChatConversationEntityJpa> findByJobPostingIdAndJobSeekerId(Long jobPostingId, Long jobSeekerId);
    List<ChatConversationEntityJpa> findAllByOrderByUpdatedAtDesc();
}
