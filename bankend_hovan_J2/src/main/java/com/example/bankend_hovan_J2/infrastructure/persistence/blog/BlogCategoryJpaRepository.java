package com.example.bankend_hovan_J2.infrastructure.persistence.blog;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogCategoryJpaRepository extends JpaRepository<BlogCategory, Long> {
    
    List<BlogCategory> findAllByOrderByCreatedAtDesc();
    
    List<BlogCategory> findByIsActiveTrueOrderByNameAsc();
    
    Optional<BlogCategory> findByNameIgnoreCase(String name);
    
    boolean existsByNameIgnoreCase(String name);
    
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
