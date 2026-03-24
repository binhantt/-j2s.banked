package com.example.bankend_hovan_J2.presentation.blog;

import com.example.bankend_hovan_J2.application.blog.BlogResponse;
import com.example.bankend_hovan_J2.application.blog.BlogService;
import com.example.bankend_hovan_J2.application.blog.CreateBlogRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping("/posts")
    public ResponseEntity<List<BlogResponse>> getAllBlogs(
            @RequestParam(required = false) String source) {
        List<BlogResponse> blogs = blogService.getAllBlogs(source);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable Long id) {
        BlogResponse blog = blogService.getBlogById(id);
        return ResponseEntity.ok(blog);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<BlogResponse>> getBlogsByCompany(@PathVariable Long companyId) {
        List<BlogResponse> blogs = blogService.getBlogsByCompany(companyId);
        return ResponseEntity.ok(blogs);
    }

    @PostMapping("/posts")
    public ResponseEntity<BlogResponse> createBlog(@Valid @RequestBody CreateBlogRequest request) {
        BlogResponse blog = blogService.createBlog(request);
        return ResponseEntity.ok(blog);
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody CreateBlogRequest request) {
        BlogResponse blog = blogService.updateBlog(id, request);
        return ResponseEntity.ok(blog);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/company/{companyId}/posts/{id}")
    public ResponseEntity<Void> deleteBlogByCompany(
            @PathVariable Long companyId,
            @PathVariable Long id) {
        blogService.deleteBlogByCompany(id, companyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<BlogResponse>> searchBlogs(
            @RequestParam String keyword,
            @RequestParam(required = false) String source) {
        List<BlogResponse> blogs = blogService.searchBlogs(keyword, source);
        return ResponseEntity.ok(blogs);
    }
}