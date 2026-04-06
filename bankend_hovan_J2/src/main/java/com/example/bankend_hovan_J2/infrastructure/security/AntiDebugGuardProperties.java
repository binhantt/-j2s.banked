package com.example.bankend_hovan_J2.infrastructure.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "anti-debug.guard")
public class AntiDebugGuardProperties {
    private int violationThreshold = 3;
    private long violationWindowSeconds = 300;
    private long lockDurationSeconds = 900;
    private int maxAuditEvents = 500;
}
