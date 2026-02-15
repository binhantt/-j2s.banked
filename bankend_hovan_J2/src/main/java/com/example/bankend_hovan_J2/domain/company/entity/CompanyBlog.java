package com.example.bankend_hovan_J2.domain.company.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyBlog {
    private Long id;
    private Long companyId;
    private String title;
    private String content;
    private String imageUrl;
    private String authorName;
    private String status; // draft, published
    private Integer views;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
