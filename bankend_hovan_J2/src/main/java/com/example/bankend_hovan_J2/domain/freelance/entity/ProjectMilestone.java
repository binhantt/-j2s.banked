package com.example.bankend_hovan_J2.domain.freelance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMilestone {
    private Long id;
    private Long projectId;
    private String title;
    private Integer percentage;
    private String status; // pending, in_progress, completed
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
