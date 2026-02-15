package com.example.bankend_hovan_J2.application.auth;

public class AuthResponseDTO {
    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String name;
    private String avatarUrl;
    private String userType;

    public AuthResponseDTO(String token, Long userId, String email, String name, 
                          String avatarUrl, String userType) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.userType = userType;
    }

    public AuthResponseDTO(String token, String refreshToken, Long userId, String email, 
                          String name, String avatarUrl, String userType) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.userType = userType;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
}
