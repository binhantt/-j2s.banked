# Features/Blog — Quản lý blog

## Tổng quan
Trang quản lý blog với 2 view:
- **BlogManagementPage:** Xem danh sách, xem chi tiết, xóa bài viết
- **BlogCreatePage:** Tạo bài viết mới (truy cập qua header khi view=blog)

Blog có 2 nguồn: `platform` (bài nền tảng) và `company` (bài công ty).

## Nguồn files
```
src/features/blog/
├── types/blogTypes.ts          ← BlogPostSummary, BlogPostDetail
├── api/blogApi.ts             ← API calls
├── store/useBlogStore.ts       ← Zustand store
└── pages/
    ├── BlogManagementPage.tsx  ← Trang danh sách
    └── BlogCreatePage.tsx      ← Trang tạo bài viết
```

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách bài viết | `01-xem-danh-sach/` |
| 02 | Xem chi tiết bài viết | `02-chi-tiet-bai-viet/` |
| 03 | Tạo bài viết mới | `03-tao-bai-viet/` |
| 04 | Xóa bài viết | `04-xoa-bai-viet/` |
