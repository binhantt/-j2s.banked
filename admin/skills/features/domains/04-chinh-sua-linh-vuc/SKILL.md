# SK-04: Chỉnh sửa lĩnh vực

## Mô tả ngắn
Chỉnh sửa tên, mô tả và trạng thái lĩnh vực hiện có. Mở modal với dữ liệu điền sẵn từ record.

## Nguồn dữ liệu
- **Store:** `useDomainStore.loadDomains()` (reload sau sửa)
- **API:** `domainApi.updateDomain(payload)` → `PUT /domains/{id}`

## Luồng chính

```
Nhấn nút Sửa (record)
→ openEditModal(record) → setEditingDomain + setFieldsValue + setEditModalVisible(true)

Form onFinish (values)
→ domainApi.updateDomain({ ...values, id: editingDomain.id }) → PUT /domains/{id}
→ message.success + setEditModalVisible(false) + setEditingDomain(null) + resetFields()
→ loadDomains() // reload
```

## Tác vụ
- [x] Mở modal với dữ liệu hiện tại điền sẵn
- [x] Sửa tên, mô tả, trạng thái
- [x] Validate + gọi API cập nhật
- [x] Reload danh sách + đóng modal

## Payload

```ts
interface UpdateDomainPayload extends CreateDomainPayload {
  id: string;
}
```

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `openEditModal()` + `handleEdit()` + Modal

### `references/`
- API endpoint: PUT /domains/{id}
- Payload interface

## Ràng buộc
- `editingDomain` lưu domain đang sửa để tránh confuse khi nhiều modal
- Sử dụng `form.onFinish`
