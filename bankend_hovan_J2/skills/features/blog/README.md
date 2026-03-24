# Features/Blog — Quản lý blog

## Tổng quan
Controller quản lý blog (platform + company). Endpoints tại `/api/blog/**`.

## Nguồn files
```
presentation/blog/
└── BlogController.java              ← Controller

application/blog/
├── BlogService.java                  ← Business logic
├── CreateBlogRequest.java            ← Request DTO
└── BlogResponse.java                ← Response DTO

domain/blog/
├── entity/BlogPost.java             ← Entity
└── repository/BlogPostRepository.java ← Repository interface
```

## Nguồn endpoint

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/api/blog/posts` | GET | Lấy danh sách bài viết |
| `/api/blog/posts/{id}` | GET | Lấy chi tiết bài viết |
| `/api/blog/company/{companyId}` | GET | Lấy bài viết theo công ty |
| `/api/blog/posts` | POST | Tạo bài viết mới |
| `/api/blog/posts/{id}` | PUT | Cập nhật bài viết |
| `/api/blog/posts/{id}` | DELETE | Xóa bài viết |
| `/api/blog/search` | GET | Tìm kiếm bài viết |

## BlogSource

| Source | Mô tả |
|--------|--------|
| `platform` | Bài viết nền tảng (admin tạo) |
| `company` | Bài viết công ty (HR tạo) |

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách bài viết | `01-danh-sach-bai-viet/` |
| 02 | Xem chi tiết bài viết | `02-chi-tiet-bai-viet/` |
| 03 | Tạo bài viết mới | `03-tao-bai-viet/` |
| 04 | Xóa bài viết | `04-xoa-bai-viet/` |
