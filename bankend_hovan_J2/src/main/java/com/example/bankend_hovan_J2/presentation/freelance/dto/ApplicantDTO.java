package com.example.bankend_hovan_J2.presentation.freelance.dto;

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
public class ApplicantDTO {
    private Long applicationId;
    private Long freelancerId;
    private String freelancerName;
    private String freelancerEmail;
    private String avatarUrl;
    private String currentPosition;
    private String hometown;
    private String currentLocation;
    private String cvUrl;
    private String certificateImages;
    private String phone;
    private String bio;
    private String status;
    private String coverLetter;
    private String achievements;
    private BigDecimal proposedPrice;
    private Integer estimatedDuration;
    private LocalDateTime appliedAt;
}
