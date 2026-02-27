package com.example.bankend_hovan_J2.presentation.freelance.dto;

import com.example.bankend_hovan_J2.domain.freelance.entity.FreelanceProject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectWithClientDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private String clientAvatar;
    private Long freelancerId;
    private String title;
    private String description;
    private BigDecimal budget;
    private BigDecimal depositAmount;
    private String depositStatus;
    private String status;
    private Integer progress;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectWithClientDTO fromProject(FreelanceProject project, String clientName, String clientEmail, String clientAvatar) {
        return ProjectWithClientDTO.builder()
                .id(project.getId())
                .clientId(project.getClientId())
                .clientName(clientName)
                .clientEmail(clientEmail)
                .clientAvatar(clientAvatar)
                .freelancerId(project.getFreelancerId())
                .title(project.getTitle())
                .description(project.getDescription())
                .budget(project.getBudget())
                .depositAmount(project.getDepositAmount())
                .depositStatus(project.getDepositStatus())
                .status(project.getStatus())
                .progress(project.getProgress())
                .deadline(project.getDeadline())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
