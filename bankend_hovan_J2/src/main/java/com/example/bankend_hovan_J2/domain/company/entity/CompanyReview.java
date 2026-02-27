package com.example.bankend_hovan_J2.domain.company.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReview {
    private Long id;
    private Long companyId;
    private Long userId;
    private Integer rating; // 1-5
    private String comment;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
