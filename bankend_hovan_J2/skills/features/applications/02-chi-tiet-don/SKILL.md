# AP-02: Xem chi tiết đơn ứng tuyển

## Mô tả ngắn
Lấy chi tiết một đơn ứng tuyển theo ID.

## Endpoint
```
GET /api/applications/{id}
```

## Luồng xử lý

```
GET /api/applications/{id}
→ applicationRepository.findById(id)
  → found → ResponseEntity.ok(app)
  → not found → ResponseEntity.notFound().build()
```

## Tác vụ
- [x] Lấy đơn theo ID
- [x] Trả về entity trực tiếp
- [x] 404 nếu không tìm thấy

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: GET /api/applications/{id}
- Repository: applicationRepository.findById()

### `references/`
- Entity: JobApplicationEntityJpa
- Repository: JobApplicationJpaRepository

## Ràng buộc
- Trả về Entity trực tiếp
