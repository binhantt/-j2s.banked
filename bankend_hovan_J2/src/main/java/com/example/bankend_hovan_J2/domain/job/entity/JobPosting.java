package com.example.bankend_hovan_J2.domain.job.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobPosting {
    private Long id;
    private Long userId; // HR user who posted
    private String title;
    private String location;
    private String salaryMin;
    private String salaryMax;
    private String jobType; // full-time, part-time, contract, internship
    private String level; // junior, mid, senior, lead
    private String experience; // 0-1, 1-3, 3-5, 5+
    private String description;
    private String requirements;
    private String benefits;
    private LocalDate deadline;
    private String status; // active, inactive, closed
    private Integer applications;
    private Integer views;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public JobPosting() {
    }

    public JobPosting(Long userId, String title, String location, String salaryMin, String salaryMax,
                     String jobType, String level, String experience, String description,
                     String requirements, String benefits, LocalDate deadline) {
        this.userId = userId;
        this.title = title;
        this.location = location;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.jobType = jobType;
        this.level = level;
        this.experience = experience;
        this.description = description;
        this.requirements = requirements;
        this.benefits = benefits;
        this.deadline = deadline;
        this.status = "active";
        this.applications = 0;
        this.views = 0;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(String salaryMin) {
        this.salaryMin = salaryMin;
    }

    public String getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(String salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getApplications() {
        return applications;
    }

    public void setApplications(Integer applications) {
        this.applications = applications;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
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
