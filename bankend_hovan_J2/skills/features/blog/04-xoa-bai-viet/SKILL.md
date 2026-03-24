# BL-04: Xóa bài viết

## Mô tả ngắn
Xóa bài viết blog khỏi database.

## Endpoint
```
DELETE /api/blog/posts/{id}
```

## Luồng xử lý

```
DELETE /api/blog/posts/{id}
→ blogService.deleteBlog(id)
  → blogRepository.existsById(id)?
    → false → throw RuntimeException("Không tìm thấy bài viết...")
  → blogRepository.deleteById(id)
→ ResponseEntity.ok().build()
```

## Tác vụ
- [x] Validate tồn tại
- [x] Xóa khỏi database
- [x] Return 200 OK

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: DELETE /api/blog/posts/{id}
- Service: BlogService.deleteBlog(id)

### `references/`
- Repository: BlogRepository.deleteById(id)
- Exception: RuntimeException

## Ràng buộc
- Không kiểm tra quyền — bất kỳ ai gọi API đều xóa được
- Không cascade delete — chỉ xóa record Blog
