package com.example.bankend_hovan_J2.domain.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Domain {
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer jobCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}