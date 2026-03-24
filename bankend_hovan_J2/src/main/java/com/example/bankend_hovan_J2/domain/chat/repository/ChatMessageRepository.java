package com.example.bankend_hovan_J2.domain.chat.repository;

import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatMessageRepository {
    ChatMessage save(ChatMessage message);
    List<ChatMessage> findByConversationId(Long conversationId);
    Page<ChatMessage> findByConversationId(Long conversationId, Pageable pageable);
    void markAsRead(Long conversationId, Long userId);
    Long countUnread(Long conversationId, Long userId);
}
