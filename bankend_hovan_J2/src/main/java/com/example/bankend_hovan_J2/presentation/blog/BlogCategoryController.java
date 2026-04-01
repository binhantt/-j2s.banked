package com.example.bankend_hovan_J2.presentation.blog;

import com.example.bankend_hovan_J2.application.blog.BlogCategoryService;
import com.example.bankend_hovan_J2.domain.blog.entity.BlogCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blog-categories")
@RequiredArgsConstructor
public class BlogCategoryController {
    
    private final BlogCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<BlogCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/active")
    public ResponseEntity<List<BlogCategory>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @PostMapping
    public ResponseEntity<BlogCategory> createCategory(@RequestBody BlogCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogCategory> updateCategory(@PathVariable Long id, @RequestBody BlogCategory category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
