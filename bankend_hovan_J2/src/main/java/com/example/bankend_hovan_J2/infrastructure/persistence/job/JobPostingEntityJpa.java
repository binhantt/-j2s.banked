package com.example.bankend_hovan_J2.infrastructure.persistence.job;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
public class JobPostingEntityJpa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "salary_min")
    private Long salaryMin;
    
    @Column(name = "salary_max")
    private Long salaryMax;
    
    @Column(name = "job_type")
    private String jobType;
    
    @Column(name = "level")
    private String level;
    
    @Column(name = "experience")
    private String experience; // Text description: "0-1 năm", "1-3 năm", "3-5 năm", "5+ năm"

    @Column(name = "experience_years_min")
    private Integer experienceYearsMin; // Số năm kinh nghiệm tối thiểu (INT)
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;
    
    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits;
    
    @Column(name = "deadline")
    private LocalDate deadline;
    
    @Column(name = "status")
    private String status = "active";
    
    @Column(name = "applications")
    private Integer applications = 0;
    
    @Column(name = "max_applicants")
    private Integer maxApplicants; // NULL = không giới hạn
    
    @Column(name = "interview_rounds")
    private Integer interviewRounds = 1; // Số vòng phỏng vấn
    
    @Column(name = "views")
    private Integer views = 0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "active";
        if (applications == null) applications = 0;
        if (views == null) views = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public Long getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Long salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Long getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Long salaryMax) {
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

    public Integer getExperienceYearsMin() {
        return experienceYearsMin;
    }

    public void setExperienceYearsMin(Integer experienceYearsMin) {
        this.experienceYearsMin = experienceYearsMin;
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
    
    public Integer getMaxApplicants() {
        return maxApplicants;
    }
    
    public void setMaxApplicants(Integer maxApplicants) {
        this.maxApplicants = maxApplicants;
    }
    
    public Integer getInterviewRounds() {
        return interviewRounds;
    }
    
    public void setInterviewRounds(Integer interviewRounds) {
        this.interviewRounds = interviewRounds;
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
