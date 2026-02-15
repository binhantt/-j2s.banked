package com.example.bankend_hovan_J2.application.company;

import com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyBlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CreateCompanyBlogUseCase {
    private final CompanyBlogRepository blogRepository;

    @Transactional
    public CompanyBlog execute(CompanyBlog blog) {
        // If status is published, set published date
        if ("published".equals(blog.getStatus())) {
            blog.setPublishedAt(LocalDateTime.now());
        }

        return blogRepository.save(blog);
    }
}
