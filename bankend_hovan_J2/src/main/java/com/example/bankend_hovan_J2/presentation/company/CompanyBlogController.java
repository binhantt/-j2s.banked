package com.example.bankend_hovan_J2.presentation.company;

import com.example.bankend_hovan_J2.application.company.CreateCompanyBlogUseCase;
import com.example.bankend_hovan_J2.application.company.UpdateCompanyBlogUseCase;
import com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog;
import com.example.bankend_hovan_J2.domain.company.repository.CompanyBlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company-blogs")
@RequiredArgsConstructor
public class CompanyBlogController {
    private final CompanyBlogRepository blogRepository;
    private final CreateCompanyBlogUseCase createBlogUseCase;
    private final UpdateCompanyBlogUseCase updateBlogUseCase;

    @PostMapping
    public ResponseEntity<CompanyBlog> createBlog(@RequestBody Map<String, Object> request) {
        CompanyBlog blog = mapToBlog(request);
        CompanyBlog created = createBlogUseCase.execute(blog);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyBlog> updateBlog(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        CompanyBlog blog = mapToBlog(request);
        CompanyBlog updated = updateBlogUseCase.execute(id, blog);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyBlog> getBlog(@PathVariable Long id) {
        return blogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyBlog>> getBlogsByCompany(@PathVariable Long companyId) {
        List<CompanyBlog> blogs = blogRepository.findByCompanyId(companyId);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/hr/{hrId}")
    public ResponseEntity<List<CompanyBlog>> getBlogsByHR(@PathVariable Long hrId) {
        List<CompanyBlog> blogs = blogRepository.findByHrId(hrId);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CompanyBlog>> getBlogsByStatus(@PathVariable String status) {
        List<CompanyBlog> blogs = blogRepository.findByStatus(status);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping
    public ResponseEntity<List<CompanyBlog>> getAllBlogs() {
        List<CompanyBlog> blogs = blogRepository.findAll();
        return ResponseEntity.ok(blogs);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        blogRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private CompanyBlog mapToBlog(Map<String, Object> request) {
        return CompanyBlog.builder()
                .companyId(getLong(request, "companyId"))
                .title(getString(request, "title"))
                .content(getString(request, "content"))
                .imageUrl(getString(request, "imageUrl"))
                .authorName(getString(request, "authorName"))
                .status(getString(request, "status"))
                .build();
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(value.toString());
    }
}
