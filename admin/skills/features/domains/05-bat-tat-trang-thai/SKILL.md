# SK-05: Bật / Tắt trạng thái lĩnh vực

## Mô tả ngắn
Kích hoạt hoặc vô hiệu hóa lĩnh vực bằng Switch trong bảng. Không cần Popconfirm xác nhận. Cập nhật state trực tiếp.

## Nguồn dữ liệu
- **Store:** `useDomainStore.updateDomainInList()`
- **API:** `domainApi.toggleDomainStatus(id, isActive)` → `PATCH /domains/{id}/status`

## Luồng chính

```
Switch onChange (checked, record)
→ handleToggleStatus(record.id, checked, record.name)
→ domainApi.toggleDomainStatus(id, checked)
→ PATCH /domains/{id}/status → body: { isActive: boolean }
→ message.success + updateDomainInList({ ...domain, isActive: checked })
```

## Tác vụ
- [x] Toggle trạng thái bằng Switch
- [x] Gọi API PATCH cập nhật
- [x] Cập nhật state trực tiếp (không reload)
- [x] Hiển thị kết quả

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `handleToggleStatus()` + store `updateDomainInList()`
- UI: Switch trong Table

### `references/`
- API endpoint: PATCH /domains/{id}/status
- Body: `{ isActive: boolean }`

## Ràng buộc
- Không dùng Popconfirm
- Không reload — chỉ cập nhật 1 item trong state
