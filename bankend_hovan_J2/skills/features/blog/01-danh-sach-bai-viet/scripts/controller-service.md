# Controller + Service — Danh sách bài viết

## Controller
```java
// src/main/java/.../presentation/blog/BlogController.java

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
}
```

## Service
```java
// src/main/java/.../application/blog/BlogService.java

@Service
@RequiredArgsConstructor
@Transactional
public class BlogService {
    private final BlogRepository blogRepository;

    public List<BlogResponse> getAllBlogs(String source) {
        List<Blog> blogs;

        if (source != null && !source.isEmpty()) {
            Blog.BlogSource blogSource = Blog.BlogSource.valueOf(source.toUpperCase());
            blogs = blogRepository.findBySourceOrderByCreatedAtDesc(blogSource);
        } else {
            blogs = blogRepository.findAllByOrderByCreatedAtDesc();
        }

        return blogs.stream()
            .map(BlogResponse::from)
            .collect(Collectors.toList());
    }
}
```

## Filter theo source
- `GET /api/blog/posts` → tất cả
- `GET /api/blog/posts?source=platform` → chỉ PLATFORM
- `GET /api/blog/posts?source=company` → chỉ COMPANY
