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
public class CompanyImage {
    private Long id;
    private Long companyId;
    private String imageUrl;
    private String description;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
