package com.example.bankend_hovan_J2.presentation.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(GoogleTokenExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleGoogleTokenExpiredException(GoogleTokenExpiredException ex) {
        log.warn("[GoogleTokenExpiredException] — {}", ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("error", "TOKEN_EXPIRED");
        response.put("message", ex.getMessage());
        response.put("status", HttpStatus.UNAUTHORIZED.value());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(DomainNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleDomainNotFoundException(DomainNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Not Found");
        response.put("message", ex.getMessage());
        response.put("status", HttpStatus.NOT_FOUND.value());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn("NoResourceFoundException: {}", ex.getResourcePath());
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Not Found");
        response.put("message", "Resource not found: " + ex.getResourcePath());
        response.put("status", HttpStatus.NOT_FOUND.value());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Validation Error");
        response.put("message", ex.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Bad Request");
        response.put("message", "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'");
        response.put("status", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        log.warn("[HttpRequestMethodNotSupported] — {} on {}", ex.getMethod(), ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Method Not Allowed");
        response.put("message",
                "HTTP method " + ex.getMethod() + " is not supported for this endpoint. "
                        + "Supported method(s): " + ex.getSupportedHttpMethods());
        response.put("status", HttpStatus.METHOD_NOT_ALLOWED.value());

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Unhandled RuntimeException", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Internal Server Error");
        response.put("message", ex.getMessage());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled Exception", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Internal Server Error");
        response.put("message", ex.getMessage());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}