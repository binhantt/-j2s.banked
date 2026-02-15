package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogPost;
import com.example.bankend_hovan_J2.domain.blog.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateBlogPostUseCase {
    private final BlogPostRepository blogPostRepository;

    @Transactional
    public BlogPost execute(BlogPost blogPost) {
        // Business logic: Set default values
        if (blogPost.getViews() == null) {
            blogPost.setViews(0);
        }
        
        return blogPostRepository.save(blogPost);
    }
}
