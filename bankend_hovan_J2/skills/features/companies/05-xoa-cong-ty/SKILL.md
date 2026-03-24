# CP-05: Xóa công ty

## Mô tả ngắn
Xóa công ty khỏi database. Cascade xóa company blogs nếu có ràng buộc DB.

## Endpoint
```
DELETE /api/companies/{id}
```

## Luồng xử lý

```
DELETE /api/companies/{id}
→ companyRepository.findById(id)
  → not found → throw RuntimeException("Company not found")
→ companyRepository.deleteById(id)
  → cascade: xóa company_blogs (nếu DB có FK cascade)
→ ResponseEntity.ok().build()
```

## Tác vụ
- [x] Validate tồn tại
- [x] Xóa cascade company_blogs (nếu có DB constraint)
- [x] Xóa khỏi database
- [x] Return 200 OK

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: DELETE /api/companies/{id}
- Repository: CompanyRepository.deleteById(id)

### `references/`
- Entity: Company
- Repository: CompanyRepository
- Related: CompanyBlog cascade delete

## Ràng buộc
- Không kiểm tra ràng buộc (jobs linked by userId/hrId, không xóa cascade)
- Không có notification khi xóa
