package com.example.bankend_hovan_J2.presentation.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ConversationDTO {
    private Long id;
    private Long hrId;
    private Long jobSeekerId;
    private Long jobPostingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ConversationUserSummaryDTO hr;
    private ConversationUserSummaryDTO jobSeeker;
}
