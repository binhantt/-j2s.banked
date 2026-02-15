package com.example.bankend_hovan_J2.domain.profile.entity;

import java.time.LocalDateTime;

public class Skill {
    private Long id;
    private Long userId;
    private String skillName;
    private String level; // beginner, intermediate, advanced, expert
    private LocalDateTime createdAt;

    public Skill() {
    }

    public Skill(Long userId, String skillName, String level) {
        this.userId = userId;
        this.skillName = skillName;
        this.level = level;
        this.createdAt = LocalDateTime.now();
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

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
