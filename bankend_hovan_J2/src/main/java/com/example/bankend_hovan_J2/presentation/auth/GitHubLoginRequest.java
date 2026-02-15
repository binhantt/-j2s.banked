package com.example.bankend_hovan_J2.presentation.auth;

public class GitHubLoginRequest {
    private String code;
    private String userType;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
