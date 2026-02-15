package com.example.bankend_hovan_J2.infrastructure.persistence.chat;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_conversations")
public class ChatConversationEntityJpa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_posting_id", nullable = false)
    private Long jobPostingId;
    
    @Column(name = "job_seeker_id", nullable = false)
    private Long jobSeekerId;
    
    @Column(name = "hr_id", nullable = false)
    private Long hrId;
    
    @Column(name = "status")
    private String status = "active";
    
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

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getJobPostingId() { return jobPostingId; }
    public void setJobPostingId(Long jobPostingId) { this.jobPostingId = jobPostingId; }
    
    public Long getJobSeekerId() { return jobSeekerId; }
    public void setJobSeekerId(Long jobSeekerId) { this.jobSeekerId = jobSeekerId; }
    
    public Long getHrId() { return hrId; }
    public void setHrId(Long hrId) { this.hrId = hrId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
