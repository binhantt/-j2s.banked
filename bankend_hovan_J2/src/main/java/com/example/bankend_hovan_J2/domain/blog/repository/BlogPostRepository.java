package com.example.bankend_hovan_J2.domain.blog.repository;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByCategory(String category);
    List<BlogPost> findByTitleContainingIgnoreCaseOrExcerptContainingIgnoreCase(String title, String excerpt);
}
