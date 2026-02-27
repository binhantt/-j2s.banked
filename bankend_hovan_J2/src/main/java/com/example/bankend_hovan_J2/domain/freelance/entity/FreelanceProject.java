package com.example.bankend_hovan_J2.domain.freelance.entity;

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
public class FreelanceProject {
    private Long id;
    private Long clientId;
    private Long freelancerId;
    private String title;
    private String description;
    private BigDecimal budget;
    private BigDecimal depositAmount;
    private String depositStatus; // pending, paid, refunded
    private String status; // draft, open, in_progress, completed, cancelled
    private Integer progress;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
