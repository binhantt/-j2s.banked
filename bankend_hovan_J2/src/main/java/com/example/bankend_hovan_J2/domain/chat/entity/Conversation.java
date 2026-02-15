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
public class Conversation {
    private Long id;
    private Long hrId;
    private Long jobSeekerId;
    private Long jobPostingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
