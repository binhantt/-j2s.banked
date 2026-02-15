package com.example.bankend_hovan_J2.application.chat;

import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SendMessageUseCase {
    private final ChatMessageRepository messageRepository;

    @Transactional
    public ChatMessage execute(ChatMessage message) {
        // Business logic: Validate message
        if (message.getMessage() == null || message.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message cannot be empty");
        }

        // Set default values
        if (message.getIsRead() == null) {
            message.setIsRead(false);
        }

        return messageRepository.save(message);
    }
}
