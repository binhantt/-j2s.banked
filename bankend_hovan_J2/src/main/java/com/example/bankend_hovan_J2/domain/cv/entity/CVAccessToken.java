package com.example.bankend_hovan_J2.domain.cv.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVAccessToken {
    private Long id;
    private String token;
    private Long cvId;
    private Long viewerId;
    private String viewerType; // 'owner' or 'hr'
    private LocalDateTime expiredAt;
    private LocalDateTime createdAt;
    private Boolean used; // Track if token has been used
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiredAt);
    }
    
    public boolean isUsed() {
        return Boolean.TRUE.equals(used);
    }
}
