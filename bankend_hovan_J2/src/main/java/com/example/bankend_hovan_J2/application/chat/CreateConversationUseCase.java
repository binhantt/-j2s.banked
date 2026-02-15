package com.example.bankend_hovan_J2.application.chat;

import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateConversationUseCase {
    private final ConversationRepository conversationRepository;

    @Transactional
    public Conversation execute(Conversation conversation) {
        // Business logic: Check if conversation already exists
        return conversationRepository
                .findByHrAndJobSeekerAndJobPosting(
                        conversation.getHrId(),
                        conversation.getJobSeekerId(),
                        conversation.getJobPostingId()
                )
                .orElseGet(() -> conversationRepository.save(conversation));
    }
}
