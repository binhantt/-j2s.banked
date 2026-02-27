package com.example.bankend_hovan_J2.infrastructure.persistence.freelance;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "freelance_projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelanceProjectEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "freelancer_id")
    private Long freelancerId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "deposit_amount", precision = 15, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "deposit_status", length = 50)
    @Builder.Default
    private String depositStatus = "pending";

    @Column(length = 50)
    @Builder.Default
    private String status = "draft";

    @Column(columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer progress = 0;

    private LocalDate deadline;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (progress == null) progress = 0;
        if (status == null) status = "draft";
        if (depositStatus == null) depositStatus = "pending";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
