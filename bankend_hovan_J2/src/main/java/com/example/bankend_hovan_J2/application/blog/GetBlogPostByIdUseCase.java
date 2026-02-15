package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogPost;
import com.example.bankend_hovan_J2.domain.blog.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GetBlogPostByIdUseCase {
    private final BlogPostRepository blogPostRepository;

    @Transactional
    public Optional<BlogPost> execute(Long id) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(id);
        
        // Business logic: Increment view count
        postOpt.ifPresent(post -> {
            post.setViews(post.getViews() + 1);
            blogPostRepository.save(post);
        });
        
        return postOpt;
    }
}
