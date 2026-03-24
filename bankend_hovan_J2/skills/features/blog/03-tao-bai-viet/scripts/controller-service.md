# Controller + Service — Tạo bài viết

## Controller
```java
@PostMapping("/posts")
public ResponseEntity<BlogResponse> createBlog(
        @Valid @RequestBody CreateBlogRequest request) {
    BlogResponse blog = blogService.createBlog(request);
    return ResponseEntity.ok(blog);
}
```

## Service
```java
public BlogResponse createBlog(CreateBlogRequest request) {
    Blog.BlogSource source = Blog.BlogSource.valueOf(request.getSource().toUpperCase());

    // Validate company blog
    if (source == Blog.BlogSource.COMPANY && request.getCompanyId() == null) {
        throw new RuntimeException("Company ID là bắt buộc cho blog công ty");
    }

    Blog blog = Blog.builder()
        .title(request.getTitle())
        .excerpt(request.getExcerpt())
        .content(request.getContent())
        .author(request.getAuthor())
        .authorAvatar(request.getAuthorAvatar())
        .category(request.getCategory())
        .image(request.getImage())
        .readTime(request.getReadTime() != null ? request.getReadTime() : "5 phút đọc")
        .views(0)
        .source(source)
        .tags(request.getTags())
        .companyId(request.getCompanyId())
        .build();

    Blog savedBlog = blogRepository.save(blog);
    return BlogResponse.from(savedBlog);
}
```

## Request Body
```json
{
  "title": "Bài viết mới",
  "excerpt": "Tóm tắt",
  "content": "Nội dung...",
  "author": "Admin",
  "authorAvatar": null,
  "category": "IT",
  "readTime": "5 phút đọc",
  "image": null,
  "tags": "react,job",
  "source": "platform",
  "companyId": null
}
```

## source values
| source | companyId | Ai tạo |
|--------|-----------|---------|
| `platform` | null | Admin |
| `company` | bắt buộc | HR |
