package com.example.bankend_hovan_J2.presentation.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationUserSummaryDTO {
    private Long id;
    private String name;
    private String avatarUrl;
}
