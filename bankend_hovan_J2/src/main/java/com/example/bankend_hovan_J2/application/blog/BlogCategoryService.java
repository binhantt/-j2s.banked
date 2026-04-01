package com.example.bankend_hovan_J2.application.blog;

import com.example.bankend_hovan_J2.domain.blog.entity.BlogCategory;
import com.example.bankend_hovan_J2.infrastructure.persistence.blog.BlogCategoryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogCategoryService {
    
    private final BlogCategoryJpaRepository categoryRepository;

    public List<BlogCategory> getAllCategories() {
        return categoryRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BlogCategory> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByNameAsc();
    }

    public BlogCategory createCategory(BlogCategory category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("Danh mục này đã tồn tại");
        }
        return categoryRepository.save(category);
    }

    public BlogCategory updateCategory(Long id, BlogCategory categoryDetails) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(categoryDetails.getName(), id)) {
            throw new RuntimeException("Tên danh mục này đã bị trùng");
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setIsActive(categoryDetails.getIsActive());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục với ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
