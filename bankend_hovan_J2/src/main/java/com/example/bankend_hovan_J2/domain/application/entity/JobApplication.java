package com.example.bankend_hovan_J2.domain.application.entity;

import java.time.LocalDateTime;

public class JobApplication {
    private Long id;
    private Long jobPostingId;
    private Long userId;
    private String cvUrl;
    private String coverLetter;
    private String status; // pending, reviewing, accepted, rejected
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public JobApplication() {
    }

    public JobApplication(Long jobPostingId, Long userId, String cvUrl, String coverLetter) {
        this.jobPostingId = jobPostingId;
        this.userId = userId;
        this.cvUrl = cvUrl;
        this.coverLetter = coverLetter;
        this.status = "pending";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Business methods
    public void updateStatus(String newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isPending() {
        return "pending".equals(this.status);
    }

    public boolean isAccepted() {
        return "accepted".equals(this.status);
    }

    public boolean isRejected() {
        return "rejected".equals(this.status);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobPostingId() {
        return jobPostingId;
    }

    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCvUrl() {
        return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
