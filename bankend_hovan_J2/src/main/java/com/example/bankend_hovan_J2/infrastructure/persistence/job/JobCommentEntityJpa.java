package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCommentEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_posting_id", nullable = false)
    private Long jobPostingId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_avatar")
    private String userAvatar;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "parent_id")
    private Long parentId;

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
