# BL-03: Tạo bài viết mới

## Mô tả ngắn
Tạo bài viết blog. Admin tạo `platform`, HR tạo `company`.

## Endpoint
```
POST /api/blog/posts
```

## Request Body
```json
{
  "title": "Tiêu đề bài viết",
  "excerpt": "Tóm tắt ngắn",
  "content": "Nội dung bài viết đầy đủ",
  "author": "Tên tác giả",
  "authorAvatar": null,
  "category": "Công nghệ",
  "readTime": "5 phút đọc",
  "image": null,
  "tags": "react,typescript,job",
  "source": "platform",
  "companyId": null
}
```

## Luồng xử lý

```
POST /api/blog/posts
→ @Valid @RequestBody CreateBlogRequest
→ blogService.createBlog(request)
  → BlogSource.valueOf(source.toUpperCase())
  → source == COMPANY && companyId == null?
    → throw RuntimeException("Company ID là bắt buộc cho blog công ty")
  → Blog.builder()
      .title, .excerpt, .content, .author
      .authorAvatar, .category, .image, .readTime
      .tags(request.getTags()) // String, không parse
      .source(blogSource)
      .companyId(companyId)
      .views(0)
      .build()
  → blogRepository.save(blog)
  → BlogResponse.from(savedBlog)
→ ResponseEntity.ok(response)
```

## Tác vụ
- [x] Validate source hợp lệ
- [x] Validate companyId cho blog COMPANY
- [x] views = 0 khi tạo mới
- [x] readTime default = "5 phút đọc" nếu null

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: POST /api/blog/posts
- Service: BlogService.createBlog(request)

### `references/`
- Request DTO: CreateBlogRequest
- Entity: Blog
- Response: BlogResponse
- Enum: BlogSource (PLATFORM, COMPANY)

## Ràng buộc
- source = "platform" → companyId = null (admin)
- source = "company" → companyId bắt buộc
- Tags giữ nguyên String, không parse thành List
