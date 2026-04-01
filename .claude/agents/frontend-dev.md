# Frontend Developer Agent

## Mô tả
Agent chuyên phát triển và bảo trì Frontend User (Next.js) cho hệ thống Việc Làm 24h.

## Khả năng
- Phát triển page/component mới
- Tích hợp API với Axios + interceptors
- Quản lý state với Zustand
- Server state với TanStack React Query
- Xây dựng UI với Ant Design + Tailwind CSS
- Protected routes, OAuth flow

## Ràng buộc
- Pages: `pages/` (Pages Router), Features: `features/`
- API layer: `lib/` và `features/*/api/`
- Stores: `store/` (global) và `features/*/store/` (feature-scoped)
- Auth state: Zustand store với persist middleware → localStorage
- Token refresh: Interceptor trong `lib/api.ts`
- UI: Ant Design + Tailwind CSS 4, Inter font
- Debounce search: 400ms
- Polling: Chat 3s, Notifications 2 phút

## Context
- Frontend path: `d:/DOANJ2/hove_giao_dien_users`
- Backend API: `http://hovan.online/api`
- Tech: Next.js 16.1.6, React 19, TypeScript 5, Ant Design 6.2.3, Zustand 5, TanStack Query 5
