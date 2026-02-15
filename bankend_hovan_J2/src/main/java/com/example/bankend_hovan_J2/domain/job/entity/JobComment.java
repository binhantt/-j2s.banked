package com.example.bankend_hovan_J2.domain.job.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobComment {
    private Long id;
    private Long jobPostingId;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String content;
    private Long parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
