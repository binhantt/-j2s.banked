# BL-01: Xem danh sách bài viết

## Mô tả ngắn
Lấy danh sách bài viết blog, có thể lọc theo nguồn (platform/company).

## Endpoint
```
GET /api/blog/posts
GET /api/blog/posts?source=platform
GET /api/blog/posts?source=company
```

## Luồng xử lý

```
GET /api/blog/posts?source=...
→ blogService.getAllBlogs(source)
  → source != null?
    → blogRepository.findBySourceOrderByCreatedAtDesc(BlogSource.valueOf(source))
    : blogRepository.findAllByOrderByCreatedAtDesc()
  → stream → BlogResponse.from(blog)
  → collect → List<BlogResponse>
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy tất cả bài viết
- [x] Lọc theo source (platform/company) nếu có
- [x] Sắp xếp theo createdAt DESC
- [x] Map Blog → BlogResponse (chuyển tags string → List, format date)

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/blog/posts
- Service: BlogService.getAllBlogs(source)

### `references/`
- Entity: Blog
- Response: BlogResponse
- Repository: BlogRepository
- BlogSource: PLATFORM, COMPANY

## Ràng buộc
- Không phân trang
- Tags: chuyển từ String (comma-separated) → List<String>
- Date: format "dd/MM/yyyy"
