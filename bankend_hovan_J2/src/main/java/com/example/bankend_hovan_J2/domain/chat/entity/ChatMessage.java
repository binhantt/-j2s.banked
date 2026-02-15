package com.example.bankend_hovan_J2.domain.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderType; // 'hr' or 'job_seeker'
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
