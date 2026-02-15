package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ChatMessageRepositoryImpl implements ChatMessageRepository {
    private final ChatMessageJpaRepository jpaRepository;

    @Override
    public ChatMessage save(ChatMessage message) {
        ChatMessageEntityJpa entity = toEntity(message);
        ChatMessageEntityJpa saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<ChatMessage> findByConversationId(Long conversationId) {
        return jpaRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long conversationId, Long userId) {
        jpaRepository.markAsRead(conversationId, userId);
    }

    @Override
    public Long countUnread(Long conversationId, Long userId) {
        return jpaRepository.countUnread(conversationId, userId);
    }

    private ChatMessageEntityJpa toEntity(ChatMessage message) {
        return ChatMessageEntityJpa.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .senderType(message.getSenderType())
                .message(message.getMessage())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private ChatMessage toDomain(ChatMessageEntityJpa entity) {
        return ChatMessage.builder()
                .id(entity.getId())
                .conversationId(entity.getConversationId())
                .senderId(entity.getSenderId())
                .senderType(entity.getSenderType())
                .message(entity.getMessage())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
