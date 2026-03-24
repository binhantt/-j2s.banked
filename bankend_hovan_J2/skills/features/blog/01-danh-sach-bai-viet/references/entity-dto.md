# Entity + DTO References

## Blog Entity
```java
// src/main/java/.../domain/blog/entity/BlogPost.java

@Entity
@Table(name = "blog_posts")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BlogPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String author;

    private String authorAvatar;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private String readTime;

    @Builder.Default
    private Integer views = 0;

    @Column(columnDefinition = "TEXT")
    private String tags; // comma-separated

    // source: PLATFORM | COMPANY
}
```

## BlogResponse
```java
// src/main/java/.../application/blog/BlogResponse.java

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BlogResponse {
    private String id;         // Long → String
    private String title;
    private String excerpt;
    private String content;
    private String author;
    private String authorAvatar;
    private String category;
    private String image;
    private String readTime;
    private Integer views;
    private String source;     // PLATFORM | COMPANY → lowercase
    private List<String> tags; // String → List (split by comma)
    private Long companyId;
    private String date;       // "dd/MM/yyyy"

    public static BlogResponse from(Blog blog) {
        List<String> tagList = blog.getTags() != null && !blog.getTags().isEmpty()
            ? Arrays.asList(blog.getTags().split(","))
            : List.of();

        return BlogResponse.builder()
            .id(blog.getId().toString())
            .title(blog.getTitle())
            .excerpt(blog.getExcerpt())
            .content(blog.getContent())
            .author(blog.getAuthor())
            .authorAvatar(blog.getAuthorAvatar())
            .category(blog.getCategory())
            .image(blog.getImage())
            .readTime(blog.getReadTime())
            .views(blog.getViews())
            .source(blog.getSource().name().toLowerCase())
            .tags(tagList)
            .companyId(blog.getCompanyId())
            .date(formatDate(blog.getCreatedAt()))
            .build();
    }
}
```

## CreateBlogRequest
```java
// src/main/java/.../application/blog/CreateBlogRequest.java

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateBlogRequest {
    @NotNull private String title;
    private String excerpt;
    @NotNull private String content;
    @NotNull private String author;
    private String authorAvatar;
    @NotNull private String category;
    private String readTime;
    private String image;
    private String tags;      // String (comma-separated)
    @NotNull private String source; // PLATFORM | COMPANY
    private Long companyId;
}
```

## BlogRepository
```java
// src/main/java/.../domain/blog/BlogRepository.java

public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findBySourceOrderByCreatedAtDesc(Blog.BlogSource source);
    List<Blog> findAllByOrderByCreatedAtDesc();
    List<Blog> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<Blog> findBySourceAndKeyword(Blog.BlogSource source, String keyword);
    List<Blog> findByKeyword(String keyword);
}
```
