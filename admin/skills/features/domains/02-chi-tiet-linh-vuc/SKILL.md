# SK-02: Xem chi tiết lĩnh vực

## Mô tả ngắn
Xem thông tin đầy đủ của lĩnh vực trong modal popup. Gọi API chi tiết khi nhấn nút "Xem" (icon Eye).

## Nguồn dữ liệu
- **Store:** `useDomainStore.loadDetail(id)` + `useDomainStore.closeDetail()`
- **API:** `domainApi.getDomainById(id)` → `GET /domains/{id}`

## Luồng chính

```
Nhấn nút Xem (record.id)
→ loadDetail(record.id) → GET /domains/{id}
→ set({ detail, detailVisible: true }) → Modal hiển thị

Nhấn đóng modal
→ closeDetail() → set({ detail: null, detailVisible: false })
```

## Tác vụ
- [x] Gọi API lấy chi tiết lĩnh vực
- [x] Hiển thị modal: tên, mô tả, trạng thái, số công việc, ngày tạo, cập nhật cuối
- [x] Đóng modal

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code: `handleViewDetail()` + Modal

### `references/`
- API endpoint: GET /domains/{id}
- Fields hiển thị đầy đủ trong modal

## Ràng buộc
- Modal: width=600px, body maxHeight=70vh + overflow-y auto
- Footer=null (không có nút)
- `detail` được set null khi đóng modal
