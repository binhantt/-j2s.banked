package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectApplicationEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "freelancer_id", nullable = false)
    private Long freelancerId;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String status = "pending";

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    @Column(name = "cv_url", length = 500)
    private String cvUrl;

    @Column(name = "proposed_price", precision = 15, scale = 2)
    private BigDecimal proposedPrice;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "pending";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
