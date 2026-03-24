# SK-01: Xem danh sách bài viết

## Mô tả ngắn
Lấy và hiển thị danh sách bài viết blog từ backend, bao gồm: tiêu đề, tác giả, nguồn, danh mục, ngày, lượt xem, thời gian đọc.

## Nguồn dữ liệu
- **Store:** `useBlogStore.loadPosts()`
- **API:** `blogApi.getPosts()` → `GET /blog/posts`

## Luồng chính

```
Page mount → useEffect → loadPosts()
→ API: GET /blog/posts → BlogPostDetail[]
→ API: map sang BlogPostSummary[]
→ set({ posts, loading: false })
→ Render: Table
```

## Tác vụ
- [x] Tải danh sách bài viết từ API
- [x] Bảng: tiêu đề, tác giả, nguồn, danh mục, ngày, lượt xem, thời gian đọc
- [x] Xem chi tiết bài viết
- [x] Xóa bài viết
- [x] Làm mới danh sách

## Nguồn bài viết (source)

| source | Label | Màu Tag |
|--------|-------|---------|
| `platform` | Nền tảng | blue |
| `company` | Công ty | green |

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code gọi store từ component
- Logic table columns

### `references/`
- Types: `BlogPostSummary`, `BlogPostDetail`
- API endpoint: GET /blog/posts
- Table columns đầy đủ

## Ràng buộc
- Phân trang: `pageSize: 5`
- Nút "Tạo bài viết" → hướng dẫn sang header
