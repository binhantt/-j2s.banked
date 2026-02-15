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
public class Company {
    private Long id;
    private Long hrId;
    private String name;
    private String logoUrl;
    private String industry;
    private String companySize;
    private Integer foundedYear;
    private String website;
    private String email;
    private String phone;
    private String address;
    private String description;
    private String mission;
    private String vision;
    private String values;
    private String benefits;
    private String workingHours;
    private String imageGallery; // JSON array of image URLs
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
