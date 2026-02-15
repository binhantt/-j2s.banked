package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyBlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UpdateCompanyBlogUseCase {
    private final CompanyBlogRepository blogRepository;

    @Transactional
    public CompanyBlog execute(Long id, CompanyBlog blog) {
        CompanyBlog existing = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Update fields
        existing.setTitle(blog.getTitle());
        existing.setContent(blog.getContent());
        existing.setImageUrl(blog.getImageUrl());
        existing.setAuthorName(blog.getAuthorName());
        
        // If changing to published and not yet published
        if ("published".equals(blog.getStatus()) && existing.getPublishedAt() == null) {
            existing.setPublishedAt(LocalDateTime.now());
        }
        existing.setStatus(blog.getStatus());

        return blogRepository.save(existing);
    }
}
