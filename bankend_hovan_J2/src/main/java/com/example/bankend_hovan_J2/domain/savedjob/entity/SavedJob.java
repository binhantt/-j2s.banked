package com.example.bankend_hovan_J2.domain.savedjob.entity;

import java.time.LocalDateTime;

public class SavedJob {
    private Long id;
    private Long userId;
    private Long jobPostingId;
    private LocalDateTime createdAt;

    public SavedJob() {
    }

    public SavedJob(Long userId, Long jobPostingId) {
        this.userId = userId;
        this.jobPostingId = jobPostingId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getJobPostingId() { return jobPostingId; }
    public void setJobPostingId(Long jobPostingId) { this.jobPostingId = jobPostingId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
