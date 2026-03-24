package com.example.bankend_hovan_J2.domain.blog;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blogs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 1000)
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(length = 500)
    private String authorAvatar;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 500)
    private String image;

    @Column(length = 20)
    private String readTime;

    @Column(nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private Integer views = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BlogSource source;

    @Column(length = 1000)
    private String tags;

    @Column(name = "company_id")
    private Long companyId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BlogSource {
        PLATFORM, COMPANY
    }
}