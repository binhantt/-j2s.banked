package com.example.bankend_hovan_J2.domain.notification.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Long id;
    private Long userId;
    private String type; // application_accepted, application_rejected, new_message, etc.
    private String title;
    private String message;
    private String relatedEntityType; // job_application, job_posting, etc.
    private Long relatedEntityId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
