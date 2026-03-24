package com.example.bankend_hovan_J2.application.domain;

import com.example.bankend_hovan_J2.domain.domain.entity.Domain;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer jobCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DomainResponse from(Domain domain) {
        return DomainResponse.builder()
                .id(domain.getId())
                .name(domain.getName())
                .description(domain.getDescription())
                .isActive(domain.getIsActive())
                .jobCount(domain.getJobCount())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}