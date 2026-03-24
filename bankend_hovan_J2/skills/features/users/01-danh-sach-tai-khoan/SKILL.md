# US-01: Xem danh sách tài khoản

## Mô tả ngắn
Lấy danh sách tất cả tài khoản User & Backend từ database, trả về JSON Map. Không phân trang.

## Endpoint
```
GET /api/admin/users
```

## Luồng xử lý

```
Frontend → GET /api/admin/users
→ Controller: userJpaRepository.findAll()
→ map: convertToResponse (UserEntityJpa → Map)
→ List<Map<String, Object>>
→ ResponseEntity.ok(list)
```

## Tác vụ
- [x] Lấy toàn bộ user từ database
- [x] Map Entity → Map<String, Object> (json response)
- [x] Trả về danh sách (không phân trang)

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: endpoint GET /api/admin/users
- convertToResponse: mapping Entity → Map response

### `references/`
- Entity: UserEntityJpa
- Response fields

## Ràng buộc
- Không phân trang — trả về toàn bộ danh sách
- Password không bao giờ được trả về (chỉ encryptedPassword lưu trong DB)
