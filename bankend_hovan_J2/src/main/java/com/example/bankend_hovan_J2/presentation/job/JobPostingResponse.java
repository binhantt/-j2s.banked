package com.example.bankend_hovan_J2.presentation.job;

import com.example.bankend_hovan_J2.infrastructure.persistence.job.JobPostingEntityJpa;
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
public class JobPostingResponse {
    private Long id;
    private Long userId;
    private String title;
    private String location;
    private String salaryMin;
    private String salaryMax;
    private String jobType;
    private String level;
    private String experience;
    private String description;
    private String requirements;
    private String benefits;
    private LocalDate deadline;
    private String status;
    private Integer applications;
    private Integer views;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields
    private String companyName;
    private Long companyId;
    private String companyLogoUrl;
    
    public static JobPostingResponse fromEntity(JobPostingEntityJpa entity) {
        return JobPostingResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .title(entity.getTitle())
                .location(entity.getLocation())
                .salaryMin(entity.getSalaryMin())
                .salaryMax(entity.getSalaryMax())
                .jobType(entity.getJobType())
                .level(entity.getLevel())
                .experience(entity.getExperience())
                .description(entity.getDescription())
                .requirements(entity.getRequirements())
                .benefits(entity.getBenefits())
                .deadline(entity.getDeadline())
                .status(entity.getStatus())
                .applications(entity.getApplications())
                .views(entity.getViews())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
