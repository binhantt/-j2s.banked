package com.example.bankend_hovan_J2.presentation.exception;

/**
 * Thrown when a Google idToken (GIS One Tap credential) has expired.
 * Results in HTTP 401 Unauthorized, allowing the frontend to detect
 * and prompt the user to re-authenticate with Google.
 */
public class GoogleTokenExpiredException extends RuntimeException {

    public GoogleTokenExpiredException(String message) {
        super(message);
    }
}
