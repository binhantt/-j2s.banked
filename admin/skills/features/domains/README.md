# Features/Domains — Quản lý lĩnh vực

## Tổng quan
Trang quản lý các lĩnh vực nghề nghiệp dùng để phân loại công việc.

## Nguồn files
```
src/features/domains/
├── types/domainTypes.ts        ← Domain, DomainSummary, CreateDomainPayload
├── api/domainApi.ts           ← API calls
├── store/useDomainStore.ts    ← Zustand store
├── components/DomainStats.tsx  ← Component thống kê
└── pages/DomainManagementPage.tsx ← Giao diện
```

## Danh sách Skills

| # | Skill | Thư mục |
|---|-------|---------|
| 01 | Xem danh sách lĩnh vực | `01-xem-danh-sach/` |
| 02 | Xem chi tiết lĩnh vực | `02-chi-tiet-linh-vuc/` |
| 03 | Tạo lĩnh vực mới | `03-tao-linh-vuc/` |
| 04 | Chỉnh sửa lĩnh vực | `04-chinh-sua-linh-vuc/` |
| 05 | Bật/Tắt trạng thái | `05-bat-tat-trang-thai/` |
| 06 | Xóa lĩnh vực | `06-xoa-linh-vuc/` |
