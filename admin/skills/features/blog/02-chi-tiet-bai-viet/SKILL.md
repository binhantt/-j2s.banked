# SK-02: Xem chi tiết bài viết

## Mô tả ngắn
Xem nội dung đầy đủ của bài viết blog trong modal. Gọi API chi tiết khi nhấn nút "Xem".

## Nguồn dữ liệu
- **Store:** `useBlogStore.loadDetail(id)` + `useBlogStore.closeDetail()`
- **API:** `blogApi.getPostById(id)` → `GET /blog/posts/{id}`

## Luồng chính

```
Nhấn nút Xem (record)
→ handleViewDetail(String(record.id))
→ loadDetail(id) → GET /blog/posts/{id}
→ set({ detail, detailVisible: true }) → Modal hiển thị

Nhấn đóng modal
→ closeDetail() → set({ detailVisible: false })
```

## Tác vụ
- [x] Gọi API lấy chi tiết bài viết
- [x] Hiển thị modal: tiêu đề, tags, tác giả, ngày, lượt xem, nội dung
- [x] Đóng modal

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `handleViewDetail()` + Modal

### `references/`
- API endpoint: GET /blog/posts/{id}
- Fields hiển thị đầy đủ

## Ràng buộc
- Modal width=900px (rộng hơn thường)
- Body: maxHeight=70vh + overflow-y auto
- Content: `white-space: pre-wrap`
