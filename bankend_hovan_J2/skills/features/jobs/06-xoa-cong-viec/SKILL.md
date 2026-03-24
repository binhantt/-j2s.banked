# JB-06: Xóa công việc

## Mô tả ngắn
Xóa tin tuyển dụng khỏi database.

## Endpoint
```
DELETE /api/jobs/{id}
```

## Luồng xử lý

```
DELETE /api/jobs/{id}
→ jobPostingRepository.deleteById(id)
→ ResponseEntity.ok().build()
```

## Tác vụ
- [x] Xóa trực tiếp (không kiểm tra applications)
- [x] Không giảm applications count (vì đã nộp rồi)
- [x] Return 200 OK

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: DELETE /api/jobs/{id}

### `references/`
- Repository: JobPostingJpaRepository

## Ràng buộc
- Không kiểm tra ứng viên đã nộp
- Không cascade delete applications
- Không có notification khi xóa
