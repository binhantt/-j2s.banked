package com.example.bankend_hovan_J2.domain.blog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    
    List<Blog> findBySourceOrderByCreatedAtDesc(Blog.BlogSource source);
    
    List<Blog> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    
    List<Blog> findByCategoryOrderByCreatedAtDesc(String category);
    
    @Query("SELECT b FROM Blog b WHERE b.source = :source AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Blog> findBySourceAndKeyword(@Param("source") Blog.BlogSource source, 
                                     @Param("keyword") String keyword);
    
    @Query("SELECT b FROM Blog b WHERE " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Blog> findByKeyword(@Param("keyword") String keyword);
    
    List<Blog> findAllByOrderByCreatedAtDesc();
    
    Optional<Blog> findByIdAndCompanyId(Long id, Long companyId);
}