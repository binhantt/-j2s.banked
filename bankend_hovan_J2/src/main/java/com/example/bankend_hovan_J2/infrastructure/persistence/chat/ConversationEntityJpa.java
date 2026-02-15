package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hr_id", nullable = false)
    private Long hrId;

    @Column(name = "job_seeker_id", nullable = false)
    private Long jobSeekerId;

    @Column(name = "job_posting_id")
    private Long jobPostingId;

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
