package com.example.bankend_hovan_J2.domain.profile.entity;

import java.time.LocalDateTime;

public class HRProfile {
    private Long id;
    private Long userId;
    private String companyName;
    private String companySize;
    private String industry;
    private String website;
    private String address;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HRProfile() {
    }

    public HRProfile(Long userId, String companyName, String companySize, 
                     String industry, String website, String address, String description) {
        this.userId = userId;
        this.companyName = companyName;
        this.companySize = companySize;
        this.industry = industry;
        this.website = website;
        this.address = address;
        this.description = description;
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
