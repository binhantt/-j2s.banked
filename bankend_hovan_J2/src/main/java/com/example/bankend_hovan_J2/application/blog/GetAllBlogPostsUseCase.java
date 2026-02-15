package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogPost;
import com.example.bankend_hovan_J2.domain.blog.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetAllBlogPostsUseCase {
    private final BlogPostRepository blogPostRepository;

    @Transactional(readOnly = true)
    public List<BlogPost> execute() {
        return blogPostRepository.findAll();
    }
}
