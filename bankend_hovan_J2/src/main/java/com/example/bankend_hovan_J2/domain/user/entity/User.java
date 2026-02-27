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
    private String currentPosition;
    private String hometown;
    private String currentLocation;
    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime locationUpdatedAt;
    private String cvUrl;
    private String certificateImages;
    private String phone;
    private String bio;
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
    
    public String getCurrentPosition() { return currentPosition; }
    public void setCurrentPosition(String currentPosition) { this.currentPosition = currentPosition; }
    
    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }
    
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
    
    public LocalDateTime getLocationUpdatedAt() { return locationUpdatedAt; }
    public void setLocationUpdatedAt(LocalDateTime locationUpdatedAt) { this.locationUpdatedAt = locationUpdatedAt; }
    
    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
    
    public String getCertificateImages() { return certificateImages; }
    public void setCertificateImages(String certificateImages) { this.certificateImages = certificateImages; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
