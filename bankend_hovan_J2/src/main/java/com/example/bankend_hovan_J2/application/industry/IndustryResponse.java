package com.example.bankend_hovan_J2.application.industry;

import com.example.bankend_hovan_J2.domain.industry.Industry;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IndustryResponse {
    
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static IndustryResponse from(Industry industry) {
        return IndustryResponse.builder()
                .id(industry.getId())
                .name(industry.getName())
                .description(industry.getDescription())
                .isActive(industry.getIsActive())
                .createdAt(industry.getCreatedAt())
                .updatedAt(industry.getUpdatedAt())
                .build();
    }
}