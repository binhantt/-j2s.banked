package com.example.bankend_hovan_J2.application.chat;

import com.example.bankend_hovan_J2.domain.chat.entity.ChatMessage;
import com.example.bankend_hovan_J2.domain.chat.entity.Conversation;
import com.example.bankend_hovan_J2.domain.chat.repository.ChatMessageRepository;
import com.example.bankend_hovan_J2.domain.chat.repository.ConversationRepository;
import com.example.bankend_hovan_J2.domain.notification.Notification;
import com.example.bankend_hovan_J2.domain.notification.NotificationRepository;
import com.example.bankend_hovan_J2.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SendMessageUseCase {
    private final ChatMessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

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

        // Save message first
        ChatMessage savedMessage = messageRepository.save(message);

        // === AUTO NOTIFICATION: Notify recipient when a new message arrives ===
        conversationRepository.findById(message.getConversationId()).ifPresent(conv -> {
            // Determine who is the recipient (not the sender)
            Long recipientId = null;
            String recipientType = null;

            if ("hr".equals(message.getSenderType())) {
                recipientId = conv.getJobSeekerId();
                recipientType = "job_seeker";
            } else if ("job_seeker".equals(message.getSenderType())) {
                recipientId = conv.getHrId();
                recipientType = "hr";
            }

            // Only create notification if we can identify a recipient
            if (recipientId != null) {
                // Get sender name
                String senderName = userRepository.findById(message.getSenderId())
                        .map(u -> u.getName() != null ? u.getName() : "Someone")
                        .orElse("Someone");

                // Shorten message preview (max 50 chars)
                String messagePreview = message.getMessage();
                if (messagePreview.length() > 50) {
                    messagePreview = messagePreview.substring(0, 47) + "...";
                }

                Notification notification = Notification.builder()
                        .userId(recipientId)
                        .type("new_message")
                        .title(" Tin nhan moi tu " + senderName)
                        .message(messagePreview)
                        .relatedEntityType("chat_conversation")
                        .relatedEntityId(conv.getId())
                        .isRead(false)
                        .build();

                notificationRepository.save(notification);
            }
        });

        return savedMessage;
    }
}
