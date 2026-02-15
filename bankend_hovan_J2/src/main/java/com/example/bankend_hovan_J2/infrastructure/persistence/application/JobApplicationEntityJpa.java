package com.example.bankend_hovan_J2.infrastructure.persistence.application;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplicationEntityJpa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_posting_id", nullable = false)
    private Long jobPostingId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "cv_url")
    private String cvUrl;
    
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;
    
    @Column(name = "status")
    private String status = "pending"; // pending, reviewing, accepted, rejected
    
    @Column(name = "user_confirmed")
    private Boolean userConfirmed = false; // User xác nhận đi làm
    
    @Column(name = "current_round")
    private Integer currentRound = 0; // Vòng phỏng vấn hiện tại
    
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

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getJobPostingId() { return jobPostingId; }
    public void setJobPostingId(Long jobPostingId) { this.jobPostingId = jobPostingId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
    
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Boolean getUserConfirmed() { return userConfirmed; }
    public void setUserConfirmed(Boolean userConfirmed) { this.userConfirmed = userConfirmed; }
    
    public Integer getCurrentRound() { return currentRound; }
    public void setCurrentRound(Integer currentRound) { this.currentRound = currentRound; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
