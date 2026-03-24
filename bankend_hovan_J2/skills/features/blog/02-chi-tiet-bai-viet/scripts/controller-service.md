# Controller + Service — Chi tiết bài viết

## Controller
```java
@GetMapping("/posts/{id}")
public ResponseEntity<BlogResponse> getBlogById(@PathVariable Long id) {
    BlogResponse blog = blogService.getBlogById(id);
    return ResponseEntity.ok(blog);
}
```

## Service
```java
public BlogResponse getBlogById(Long id) {
    Blog blog = blogRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));

    // Tăng views +1 mỗi khi xem
    blog.setViews(blog.getViews() + 1);
    blogRepository.save(blog);

    return BlogResponse.from(blog);
}
```

## Lưu ý
- Views tăng **mỗi lần** gọi API này
- Cả admin xem cũng làm tăng views
