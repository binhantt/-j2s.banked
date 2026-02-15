package com.example.bankend_hovan_J2.domain.profile.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Education {
    private Long id;
    private Long userId;
    private String degree;
    private String school;
    private String fieldOfStudy;
    private LocalDate startDate;
    private LocalDate endDate;
    private String gpa;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Education() {
    }

    public Education(Long userId, String degree, String school, String fieldOfStudy,
                    LocalDate startDate, LocalDate endDate, String gpa, String description) {
        this.userId = userId;
        this.degree = degree;
        this.school = school;
        this.fieldOfStudy = fieldOfStudy;
        this.startDate = startDate;
        this.endDate = endDate;
        this.gpa = gpa;
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

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getGpa() {
        return gpa;
    }

    public void setGpa(String gpa) {
        this.gpa = gpa;
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
