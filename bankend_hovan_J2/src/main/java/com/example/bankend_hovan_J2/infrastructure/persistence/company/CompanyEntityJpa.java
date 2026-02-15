package com.example.bankend_hovan_J2.infrastructure.persistence.company;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hr_id", nullable = false)
    private Long hrId;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "founded_year")
    private Integer foundedYear;

    private String website;
    private String email;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(columnDefinition = "TEXT")
    private String vision;

    @Column(name = "company_values", columnDefinition = "TEXT")
    private String values;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "working_hours")
    private String workingHours;

    @Column(name = "image_gallery", columnDefinition = "TEXT")
    private String imageGallery; // JSON array of image URLs

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
