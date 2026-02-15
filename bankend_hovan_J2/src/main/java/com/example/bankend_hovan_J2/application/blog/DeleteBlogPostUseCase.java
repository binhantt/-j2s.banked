package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeleteBlogPostUseCase {
    private final BlogPostRepository blogPostRepository;

    @Transactional
    public boolean execute(Long id) {
        if (!blogPostRepository.existsById(id)) {
            return false;
        }
        
        blogPostRepository.deleteById(id);
        return true;
    }
}
