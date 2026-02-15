package com.example.bankend_hovan_J2.presentation.blog;

import com.example.bankend_hovan_J2.application.blog.*;
import com.example.bankend_hovan_J2.domain.blog.entity.BlogPost;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/blog")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BlogController {

    private final GetAllBlogPostsUseCase getAllBlogPostsUseCase;
    private final GetBlogPostByIdUseCase getBlogPostByIdUseCase;
    private final CreateBlogPostUseCase createBlogPostUseCase;
    private final UpdateBlogPostUseCase updateBlogPostUseCase;
    private final DeleteBlogPostUseCase deleteBlogPostUseCase;
    private final com.example.bankend_hovan_J2.domain.company.repository.CompanyBlogRepository companyBlogRepository;

    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts(
            @RequestParam(required = false) String source) {
        try {
            List<Map<String, Object>> response = new ArrayList<>();
            
            // If source is specified, only get from that source
            if ("platform".equals(source)) {
                List<BlogPost> posts = getAllBlogPostsUseCase.execute();
                response = posts.stream()
                        .map(post -> convertToResponse(post, "platform"))
                        .collect(Collectors.toList());
            } else if ("company".equals(source)) {
                List<com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog> companyBlogs = 
                    companyBlogRepository.findByStatus("published");
                response = companyBlogs.stream()
                        .map(this::convertCompanyBlogToResponse)
                        .collect(Collectors.toList());
            } else {
                // Get both platform and company blogs
                List<BlogPost> posts = getAllBlogPostsUseCase.execute();
                response.addAll(posts.stream()
                        .map(post -> convertToResponse(post, "platform"))
                        .collect(Collectors.toList()));
                
                List<com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog> companyBlogs = 
                    companyBlogRepository.findByStatus("published");
                response.addAll(companyBlogs.stream()
                        .map(this::convertCompanyBlogToResponse)
                        .collect(Collectors.toList()));
                
                // Sort by date (newest first)
                response.sort((a, b) -> {
                    String dateA = (String) a.get("date");
                    String dateB = (String) b.get("date");
                    return dateB.compareTo(dateA);
                });
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching blog posts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<Map<String, Object>> getPostById(@PathVariable String id) {
        try {
            log.info("Fetching blog post with id: {}", id);
            
            // Check if it's a company blog (prefixed with "company_")
            if (id.startsWith("company_")) {
                Long companyBlogId = Long.parseLong(id.substring(8));
                log.info("Fetching company blog with id: {}", companyBlogId);
                
                Optional<com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog> blogOpt = 
                    companyBlogRepository.findById(companyBlogId);
                
                if (blogOpt.isEmpty()) {
                    log.warn("Company blog not found with id: {}", companyBlogId);
                    return ResponseEntity.notFound().build();
                }
                
                com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog blog = blogOpt.get();
                // Increment views
                blog.setViews(blog.getViews() != null ? blog.getViews() + 1 : 1);
                companyBlogRepository.save(blog);
                
                return ResponseEntity.ok(convertCompanyBlogToResponse(blog));
            } else {
                // Platform blog
                Long blogId = Long.parseLong(id);
                log.info("Fetching platform blog with id: {}", blogId);
                
                Optional<BlogPost> postOpt = getBlogPostByIdUseCase.execute(blogId);
                
                if (postOpt.isEmpty()) {
                    log.warn("Platform blog not found with id: {}", blogId);
                    return ResponseEntity.notFound().build();
                }
                
                return ResponseEntity.ok(convertToResponse(postOpt.get()));
            }
        } catch (NumberFormatException e) {
            log.error("Invalid blog post id format: {}", id, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching blog post with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(@RequestBody BlogPost blogPost) {
        try {
            BlogPost created = createBlogPostUseCase.execute(blogPost);
            return ResponseEntity.ok(convertToResponse(created));
        } catch (Exception e) {
            log.error("Error creating blog post", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Map<String, Object>> updatePost(
            @PathVariable Long id,
            @RequestBody BlogPost blogPost) {
        try {
            Optional<BlogPost> updated = updateBlogPostUseCase.execute(id, blogPost);
            
            if (updated.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(convertToResponse(updated.get()));
        } catch (Exception e) {
            log.error("Error updating blog post", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            boolean deleted = deleteBlogPostUseCase.execute(id);
            
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting blog post", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Map<String, Object> convertToResponse(BlogPost post) {
        return convertToResponse(post, "platform");
    }

    private Map<String, Object> convertToResponse(BlogPost post, String source) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", post.getId().toString());
        response.put("title", post.getTitle());
        response.put("excerpt", post.getExcerpt());
        response.put("content", post.getContent());
        response.put("author", post.getAuthor());
        response.put("authorAvatar", post.getAuthorAvatar());
        response.put("category", post.getCategory());
        response.put("image", post.getImage());
        response.put("date", post.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        response.put("readTime", post.getReadTime());
        response.put("views", post.getViews());
        response.put("source", source);
        
        // Parse tags from comma-separated string to array
        List<String> tags = post.getTags() != null 
            ? Arrays.asList(post.getTags().split(","))
            : new ArrayList<>();
        response.put("tags", tags);
        
        return response;
    }

    private Map<String, Object> convertCompanyBlogToResponse(
            com.example.bankend_hovan_J2.domain.company.entity.CompanyBlog blog) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", "company_" + blog.getId().toString());
        response.put("title", blog.getTitle() != null ? blog.getTitle() : "");
        response.put("excerpt", blog.getContent() != null && blog.getContent().length() > 150 
            ? blog.getContent().substring(0, 150) + "..." 
            : (blog.getContent() != null ? blog.getContent() : ""));
        response.put("content", blog.getContent() != null ? blog.getContent() : "");
        response.put("author", blog.getAuthorName() != null ? blog.getAuthorName() : "Company");
        response.put("authorAvatar", null);
        response.put("category", "Công ty");
        response.put("image", blog.getImageUrl());
        
        // Handle date formatting with null safety
        String formattedDate = "N/A";
        try {
            if (blog.getPublishedAt() != null) {
                formattedDate = blog.getPublishedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } else if (blog.getCreatedAt() != null) {
                formattedDate = blog.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }
        } catch (Exception e) {
            log.warn("Error formatting date for blog {}", blog.getId(), e);
        }
        response.put("date", formattedDate);
        
        response.put("readTime", calculateReadTime(blog.getContent()));
        response.put("views", blog.getViews() != null ? blog.getViews() : 0);
        response.put("source", "company");
        response.put("companyId", blog.getCompanyId());
        response.put("tags", Arrays.asList("Company", "Tin tức"));
        
        return response;
    }

    private String calculateReadTime(String content) {
        if (content == null) return "1 phút đọc";
        int words = content.split("\\s+").length;
        int minutes = Math.max(1, words / 200); // Average reading speed
        return minutes + " phút đọc";
    }
}
