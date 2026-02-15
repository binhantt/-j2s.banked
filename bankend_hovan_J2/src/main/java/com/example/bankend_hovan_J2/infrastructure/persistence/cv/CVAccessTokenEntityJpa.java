package com.example.bankend_hovan_J2.infrastructure.persistence.cv;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cv_access_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVAccessTokenEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 64)
    private String token;
    
    @Column(nullable = false)
    private Long cvId;
    
    @Column(nullable = false)
    private Long viewerId;
    
    @Column(nullable = false, length = 20)
    private String viewerType;
    
    @Column(nullable = false)
    private LocalDateTime expiredAt;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private Boolean used;
}
