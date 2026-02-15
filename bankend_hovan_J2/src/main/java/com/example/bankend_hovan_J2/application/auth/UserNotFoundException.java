package com.example.bankend_hovan_J2.application.auth;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
