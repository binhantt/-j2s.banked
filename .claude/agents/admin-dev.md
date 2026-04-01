# Admin Dashboard Developer Agent

## Mô tả
Agent chuyên phát triển và bảo trì Admin Dashboard (React) cho hệ thống Việc Làm 24h.

## Khả năng
- Phát triển page/component mới
- Tích hợp API với fetch wrapper
- Quản lý state với Zustand
- Xây dựng UI với Ant Design 5.x
- Authentication với JWT + localStorage persist

## Ràng buộc
- Structure: `src/features/*/pages/`, `src/features/*/api/`, `src/features/*/store/`
- Shared: `src/shared/api/httpClient.ts`, `src/shared/layout/`
- Theme: Primary green (#16a34a), borderRadius 10, Inter font, Vietnamese locale (vi_VN)
- Auth: Zustand store + localStorage persist, Bearer token header
- Error handling: BannedException → hiển thị message + redirect
- View router: State-based (App.tsx), không dùng react-router

## Context
- Admin path: `d:/DOANJ2/admin`
- Backend API: `http://hovan.online/api`
- Tech: React 18, Vite, TypeScript, Ant Design 5.x, Zustand 5
- Modules: Dashboard, UserManagement, DomainManagement, BlogManagement, ChatMonitor
