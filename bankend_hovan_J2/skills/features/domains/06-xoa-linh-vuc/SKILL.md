# DM-06: Xóa lĩnh vực

## Mô tả ngắn
Xóa lĩnh vực khỏi database. Không xóa được nếu có công ty đang thuộc lĩnh vực này.

## Endpoint
```
DELETE /api/domains/{id}
```

## Luồng xử lý

```
DELETE /api/domains/{id}
→ domainService.deleteDomain(id)
  → domainRepository.existsById(id)?
    → false → throw RuntimeException
  → companyRepository.existsByDomainId(id)?
    → true → throw IllegalArgumentException("Lĩnh vực này đã có công ty...")
  → domainRepository.deleteById(id)
→ ResponseEntity.ok().build()
```

## Tác vụ
- [x] Validate tồn tại
- [x] Kiểm tra không có công ty thuộc lĩnh vực
- [x] Xóa khỏi database
- [x] Return 200 OK

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: DELETE /api/domains/{id}
- Service: DomainService.deleteDomain(id)

### `references/`
- Exception: IllegalArgumentException (khác với RuntimeException thông thường)
- Check: companyRepository.existsByDomainId(id)

## Ràng buộc
- Không xóa được nếu có công ty đang reference đến lĩnh vực
- Ném IllegalArgumentException với message rõ ràng
- Không xóa cascade — chỉ xóa record Domain
