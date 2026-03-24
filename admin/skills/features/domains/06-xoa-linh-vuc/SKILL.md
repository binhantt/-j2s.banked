# SK-06: Xóa lĩnh vực

## Mô tả ngắn
Xóa lĩnh vực khỏi hệ thống. Yêu cầu xác nhận bằng Popconfirm trước khi xóa. Cập nhật state trực tiếp.

## Nguồn dữ liệu
- **Store:** `useDomainStore.removeDomainById()`
- **API:** `domainApi.deleteDomain(id)` → `DELETE /domains/{id}`

## Luồng chính

```
Nhấn nút Xóa → Popconfirm xác nhận
→ handleDelete(record.id, record.name)
→ domainApi.deleteDomain(id) → DELETE /domains/{id}
→ message.success + removeDomainById(id) // filter khỏi mảng
```

## Tác vụ
- [x] Nhấn xóa → Popconfirm xác nhận
- [x] Gọi API DELETE
- [x] Cập nhật state trực tiếp (không reload)
- [x] Hiển thị kết quả

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `handleDelete()` + store `removeDomainById()`
- UI: Button + Popconfirm

### `references/`
- API endpoint: DELETE /domains/{id}

## Ràng buộc
- Popconfirm hiển thị tên lĩnh vực đang xóa
- `okButtonProps={{ danger: true }}` → nút xác nhận màu đỏ
- Không reload — `removeDomainById` chỉ filter mảng cục bộ
