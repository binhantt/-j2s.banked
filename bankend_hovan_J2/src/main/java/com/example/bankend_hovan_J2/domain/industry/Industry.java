package com.example.bankend_hovan_J2.domain.industry;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "industries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Industry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Business methods
    public void activate() {
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public void updateInfo(String name, String description) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name.trim();
        }
        this.description = description != null ? description.trim() : null;
    }
}