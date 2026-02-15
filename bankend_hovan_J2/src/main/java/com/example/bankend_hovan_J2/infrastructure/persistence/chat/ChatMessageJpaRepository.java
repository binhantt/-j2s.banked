package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageJpaRepository extends JpaRepository<ChatMessageEntityJpa, Long> {
    List<ChatMessageEntityJpa> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    @Modifying
    @Query("UPDATE ChatMessageEntityJpa m SET m.isRead = true WHERE m.conversationId = :conversationId AND m.senderId != :userId")
    void markAsRead(Long conversationId, Long userId);
    
    @Query("SELECT COUNT(m) FROM ChatMessageEntityJpa m WHERE m.conversationId = :conversationId AND m.senderId != :userId AND m.isRead = false")
    Long countUnread(Long conversationId, Long userId);
}
