package com.example.bankend_hovan_J2.domain.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String excerpt;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private String author;
    
    private String authorAvatar;
    
    @Column(nullable = false)
    private String category;
    
    private String image;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private String readTime;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer views = 0;
    
    @Column(columnDefinition = "TEXT")
    private String tags;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
