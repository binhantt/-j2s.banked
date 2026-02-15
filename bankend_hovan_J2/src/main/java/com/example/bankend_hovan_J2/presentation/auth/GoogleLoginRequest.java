package com.example.bankend_hovan_J2.presentation.auth;

public class GoogleLoginRequest {
    private String idToken;
    private String userType; // job_seeker or freelancer

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
