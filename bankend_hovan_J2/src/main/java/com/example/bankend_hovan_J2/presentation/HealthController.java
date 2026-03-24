package com.example.bankend_hovan_J2.presentation;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*")
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "Backend is running!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/api/health")
    public Map<String, Object> apiHealth() {
        return Map.of(
            "status", "OK",
            "timestamp", System.currentTimeMillis(),
            "message", "API is running"
        );
    }
}
