package com.example.bankend_hovan_J2.domain.user.entity;

import com.example.bankend_hovan_J2.domain.user.valueobject.Email;
import java.time.LocalDateTime;

public class User {
    private Long id;
    private Email email;
    private String name;
    private String avatarUrl;
    private String provider; // google, github, facebook
    private String providerId;
    private String userType; // job_seeker, freelancer
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public User(Email email, String name, String provider, String providerId, String userType) {
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.providerId = providerId;
        this.userType = userType;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Email getEmail() { return email; }
    public void setEmail(Email email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
