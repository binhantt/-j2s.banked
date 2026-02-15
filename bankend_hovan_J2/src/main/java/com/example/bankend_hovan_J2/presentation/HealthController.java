package com.example.bankend_hovan_J2.presentation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String home() {
        return "Backend is running!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
