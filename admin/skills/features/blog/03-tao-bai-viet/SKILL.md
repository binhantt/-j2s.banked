# SK-03: Tạo bài viết mới

## Mô tả ngắn
Tạo bài viết blog mới từ giao diện admin. Truy cập qua nút "+ Bài viết mới" trong header khi view=blog. Sau tạo → quay về BlogManagementPage.

## Nguồn dữ liệu
- **File:** `src/features/blog/pages/BlogCreatePage.tsx`
- **API:** `blogApi.createPost(payload)` → `POST /blog/posts`

## Luồng chính

```
Header nhấn "+ Bài viết mới"
→ setView('blogCreate') → Render <BlogCreatePage />

Form submit (values)
→ blogApi.createPost(values) → POST /blog/posts
→ console.log('Sending blog post data:', data)
→ message.success + onBackToList()
```

## Tác vụ
- [x] Nhập: tiêu đề, excerpt, nội dung, tác giả, danh mục, thời gian đọc
- [x] Nhập tags (comma-separated)
- [x] Gọi API tạo bài viết
- [x] Quay lại danh sách blog

## Payload (CreateBlogPostPayload)

```ts
interface CreateBlogPostPayload {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  readTime: string;
  image?: string | null;
  tags?: string[];
}
```

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code form + submit
- API createPost logic (chuyển đổi payload)

### `references/`
- API endpoint: POST /blog/posts
- Fields đầy đủ
- Mapping tags: array ↔ comma-separated string

## Ràng buộc
- Admin tạo luôn có `source = 'platform'` (không phải company)
- Tags: nhập comma-separated, API tự join/split
- Sau tạo → `onBackToList()` không reload
