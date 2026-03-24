# BL-02: Xem chi tiết bài viết

## Mô tả ngắn
Lấy chi tiết bài viết theo ID. Tự động tăng views +1 mỗi khi xem.

## Endpoint
```
GET /api/blog/posts/{id}
```

## Luồng xử lý

```
GET /api/blog/posts/{id}
→ blogService.getBlogById(id)
  → blogRepository.findById(id)
    → not found → throw RuntimeException("Không tìm thấy bài viết...")
  → blog.setViews(blog.getViews() + 1)
  → blogRepository.save(blog) // tăng views
  → BlogResponse.from(blog)
→ ResponseEntity.ok(response)
```

## Tác vụ
- [x] Lấy bài viết theo ID
- [x] Tăng views +1
- [x] Lưu views đã tăng
- [x] Trả về BlogResponse đầy đủ (kể cả content)

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/blog/posts/{id}
- Service: BlogService.getBlogById(id)
- Lưu ý: tăng views trước khi map response

### `references/`
- Entity: Blog
- Response: BlogResponse (đầy đủ, khác với summary)
- Exception: RuntimeException

## Ràng buộc
- Không tìm thấy → throw RuntimeException
- Views tăng mỗi lần gọi API này (kể cả admin xem)
