# SK-01: Xem danh sách lĩnh vực

## Mô tả ngắn
Lấy và hiển thị danh sách lĩnh vực nghề nghiệp từ backend, kèm thống kê (DomainStats) và bảng quản lý với phân trang.

## Nguồn dữ liệu
- **Store:** `useDomainStore.loadDomains()`
- **API:** `domainApi.getDomains()` → `GET /domains`

## Luồng chính

```
Page mount → useEffect → loadDomains()
→ API: GET /domains → Domain[]
→ API: map sang DomainSummary[]
→ set({ domains, loading: false })
→ Render: DomainStats + Table
```

## Tác vụ
- [x] Tải danh sách lĩnh vực từ API
- [x] Hiển thị thống kê (DomainStats component)
- [x] Bảng: tên, trạng thái, số công việc, ngày tạo, thao tác
- [x] Phân trang (10 dòng/trang, showSizeChanger, showQuickJumper)
- [x] Làm mới danh sách

## Cách sử dụng code trong thư mục

### `scripts/`
- Đoạn code gọi store từ component
- Logic filter và render table columns

### `references/`
- Types: `Domain`, `DomainSummary`
- API endpoint: GET /domains
- Mapping Domain → DomainSummary
- Màu tag theo số công việc

## Ràng buộc
- Phân trang: `pageSize: 10`, có `showSizeChanger` + `showQuickJumper`
- Số công việc hiển màu: >100 green, >50 orange, ≤50 default
