package com.example.bankend_hovan_J2.domain.freelance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectApplication {
    private Long id;
    private Long projectId;
    private Long freelancerId;
    private String status; // pending, accepted, rejected
    private String coverLetter;
    private String achievements; // Awards, certificates, notable achievements
    private String cvUrl; // CV file URL attached with application
    private BigDecimal proposedPrice;
    private Integer estimatedDuration; // in days
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
