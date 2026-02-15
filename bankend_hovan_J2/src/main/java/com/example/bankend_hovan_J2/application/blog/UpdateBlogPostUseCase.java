package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogPost;
import com.example.bankend_hovan_J2.domain.blog.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UpdateBlogPostUseCase {
    private final BlogPostRepository blogPostRepository;

    @Transactional
    public Optional<BlogPost> execute(Long id, BlogPost updatedPost) {
        Optional<BlogPost> existingPostOpt = blogPostRepository.findById(id);
        
        if (existingPostOpt.isEmpty()) {
            return Optional.empty();
        }
        
        BlogPost existingPost = existingPostOpt.get();
        
        // Update fields
        if (updatedPost.getTitle() != null) {
            existingPost.setTitle(updatedPost.getTitle());
        }
        if (updatedPost.getExcerpt() != null) {
            existingPost.setExcerpt(updatedPost.getExcerpt());
        }
        if (updatedPost.getContent() != null) {
            existingPost.setContent(updatedPost.getContent());
        }
        if (updatedPost.getCategory() != null) {
            existingPost.setCategory(updatedPost.getCategory());
        }
        if (updatedPost.getImage() != null) {
            existingPost.setImage(updatedPost.getImage());
        }
        if (updatedPost.getTags() != null) {
            existingPost.setTags(updatedPost.getTags());
        }
        if (updatedPost.getReadTime() != null) {
            existingPost.setReadTime(updatedPost.getReadTime());
        }
        
        return Optional.of(blogPostRepository.save(existingPost));
    }
}
