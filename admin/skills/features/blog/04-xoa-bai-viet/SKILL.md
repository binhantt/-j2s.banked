# SK-04: Xóa bài viết

## Mô tả ngắn
Xóa bài viết blog khỏi hệ thống. Không có Popconfirm — gọi trực tiếp khi nhấn nút. Import dynamic blogApi để tránh circular dependency.

## Nguồn dữ liệu
- **Store:** `useBlogStore.removePostById()`
- **API:** `blogApi.deletePost(id)` → `DELETE /blog/posts/{id}`

## Luồng chính

```
Nhấn nút Xóa
→ handleDelete(String(record.id))
→ import dynamic blogApi → blogApi.deletePost(id)
→ DELETE /blog/posts/{id}
→ message.success + removePostById(id)
```

## Tác vụ
- [x] Gọi trực tiếp API DELETE (không Popconfirm)
- [x] Cập nhật state trực tiếp (không reload)
- [x] Import dynamic tránh circular dependency

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `handleDelete()` với dynamic import

### `references/`
- API endpoint: DELETE /blog/posts/{id}
- Giải thích dynamic import

## Ràng buộc
- **Không có Popconfirm** — xóa trực tiếp
- Dynamic import: `const { blogApi } = await import('../api/blogApi')`
- `removePostById` dùng `String()` comparison
- Không reload — chỉ filter mảng cục bộ
