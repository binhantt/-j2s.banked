# SK-03: Tạo lĩnh vực mới

## Mô tả ngắn
Tạo lĩnh vực nghề nghiệp mới với tên, mô tả (optional), checkbox kích hoạt. Sau tạo → reload danh sách.

## Nguồn dữ liệu
- **Store:** `useDomainStore.loadDomains()` (reload sau tạo)
- **API:** `domainApi.createDomain(payload)` → `POST /domains`

## Luồng chính

```
Nhấn "Thêm lĩnh vực" → setCreateModalVisible(true)

Form onFinish (values)
→ domainApi.createDomain(values) → POST /domains
→ message.success('Tạo lĩnh vực thành công')
→ setCreateModalVisible(false) + resetFields()
→ loadDomains() // reload
```

## Tác vụ
- [x] Mở modal tạo lĩnh vực
- [x] Nhập tên (bắt buộc), mô tả (optional)
- [x] Checkbox kích hoạt ngay (default: true)
- [x] Validate + gọi API tạo
- [x] Reload danh sách + đóng modal

## Payload

```ts
interface CreateDomainPayload {
  name: string;       // Required
  description?: string; // Optional
  isActive?: boolean;   // Default: true
}
```

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `handleCreate()` + Modal với Form onFinish

### `references/`
- API endpoint: POST /domains
- Payload interface

## Ràng buộc
- Sử dụng `form.onFinish` thay vì `Modal.onOk` → tự validate
- Sau tạo → gọi `loadDomains()` reload toàn bộ danh sách
