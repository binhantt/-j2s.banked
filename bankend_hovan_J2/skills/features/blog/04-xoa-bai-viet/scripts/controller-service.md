# Controller + Service — Xóa bài viết

## Controller
```java
@DeleteMapping("/posts/{id}")
public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
    blogService.deleteBlog(id);
    return ResponseEntity.ok().build();
}
```

## Service
```java
public void deleteBlog(Long id) {
    if (!blogRepository.existsById(id)) {
        throw new RuntimeException("Không tìm thấy bài viết với ID: " + id);
    }
    blogRepository.deleteById(id);
}
```
