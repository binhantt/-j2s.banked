package com.example.bankend_hovan_J2.domain.profile.entity;

import java.time.LocalDateTime;

public class JobSeekerProfile {
    private Long id;
    private Long userId;
    private String phone;
    private String location;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public JobSeekerProfile() {
    }

    public JobSeekerProfile(Long userId, String phone, String location, String bio) {
        this.userId = userId;
        this.phone = phone;
        this.location = location;
        this.bio = bio;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
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
