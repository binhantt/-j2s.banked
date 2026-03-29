package com.example.bankend_hovan_J2.domain.company.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "company_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 100)
    private String title;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ImageType type = ImageType.GENERAL;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ImageType {
        OFFICE,      // Văn phòng
        TEAM,        // Đội ngũ
        ACTIVITY,    // Hoạt động
        GENERAL      // Chung
    }
}
