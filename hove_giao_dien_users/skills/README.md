# Skills Documentation — ViệcLàm24h

> Tài liệu hướng dẫn kỹ năng cho Next.js frontend project.

## Tổng quan Project

**Project:** ViệcLàm24h — Nền tảng tuyển dụng & freelance
**Frontend:** Next.js (TypeScript) + Antd + Tailwind CSS
**Backend API:** `http://localhost:8080/api`
**Source:** `D:/DOANJ2/hove_giao_dien_users/`

---

## Kiến trúc hệ thống

Xem chi tiết tại: [shared/architecture.md](./shared/architecture.md)

---

## Cấu trúc Skills

```
skills/
├── shared/
│   └── architecture.md        ← Kiến trúc tổng quan
├── README.md                  ← File này
├── auth/                      ← Xác thực
│   ├── 01-dang-nhap-google/
│   ├── 02-dang-nhap-github/
│   └── 03-dang-xuat/
├── jobs/                      ← Việc làm
│   ├── 01-danh-sach-viec-lam/
│   ├── 02-chi-tiet-viec-lam/
│   ├── 03-dang-tin-viec-lam/
│   ├── 04-luu-viec-lam/
│   └── 05-ung-tuyen/
├── profile/                   ← Hồ sơ
│   ├── 01-xem-profile/
│   └── 02-cap-nhat-profile/
├── blog/                      ← Blog
│   ├── 01-danh-sach-bai-viet/
│   └── 02-chi-tiet-bai-viet/
├── chat/                      ← Chat
│   ├── 01-danh-sach-tin-nhan/
│   └── 02-gui-tin-nhan/
├── company/                   ← Công ty
│   ├── 01-chi-tiet-cong-ty/
│   └── 02-luu-cong-ty/
├── freelance/                 ← Freelance
│   ├── 01-danh-sach-du-an/
│   ├── 02-chi-tiet-du-an/
│   ├── 03-ung-tuyen-du-an/
│   └── 04-tao-du-an/
└── applications/              ← Đơn ứng tuyển
    ├── 01-danh-sach-ung-tuyen/
    └── 02-quan-ly-ung-tuyen/
```

---

## Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|----------|
| Next.js | Framework frontend |
| TypeScript | Ngôn ngữ |
| Antd | UI component library |
| Tailwind CSS | Styling |
| Zustand | State management |
| Axios | HTTP client |
| dayjs | Date formatting |

---

## User Types (Loại tài khoản)

```typescript
type UserType = 'job_seeker' | 'freelancer' | 'hr';
```

| Loại | Mô tả | Quyền chính |
|------|--------|-------------|
| `job_seeker` | Ứng viên tìm việc | Ứng tuyển, lưu việc, xem công ty |
| `freelancer` | Freelancer | Ứng tuyển dự án, tạo dự án |
| `hr` | Nhà tuyển dụng | Đăng tin, quản lý ứng viên |

---

## API Base

- **Base URL:** `http://localhost:8080`
- **API Prefix:** `/api`
- **Auth Header:** `Authorization: Bearer <token>`

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const api = axios.create({ baseURL: API_URL, timeout: 30000 });
```

---

## Store chính

| Store | File | Mục đích |
|-------|------|----------|
| `useAuthStore` | `store/useAuthStore.ts` | Auth state + OAuth login |
| `useJobStore` | `store/useJobStore.ts` | Job list + filters |

---

## Navigation chính

| Route | File | Skill liên quan |
|-------|------|-----------------|
| `/login` | `pages/login.tsx` | OAuth login |
| `/jobs` | `features/jobs/JobsListPage.tsx` | Job listing |
| `/jobs/[id]` | `features/jobs/JobDetailFeature.tsx` | Job detail |
| `/post-job` | `features/jobs/PostJobPage.tsx` | Post job |
| `/blog` | `features/blog/BlogListPage.tsx` | Blog list |
| `/blog/[id]` | `features/blog/BlogDetailFeature.tsx` | Blog detail |
| `/chat` | `features/chat/ChatPage.tsx` | Chat list |
| `/chat/[id]` | `features/chat/ChatPage.tsx` | Chat messages |
| `/profile` | `features/profile/index.tsx` | Profile management |
| `/company/[id]` | `features/companies/CompanyDetailFeature.tsx` | Company detail |
| `/freelance/[id]` | `features/freelance/FreelanceDetailFeature.tsx` | Project detail |
| `/my-applications` | `features/applications/MyApplicationsPage.tsx` | My applications |
| `/applications/[jobId]` | `features/applications/JobApplicationsPage.tsx` | HR manage |

---

## Cách đọc file SKILL.md

Mỗi skill có 4 phần chính:

1. **Mô tả** — Giới thiệu ngắn về chức năng
2. **Tác vụ (Tasks)** — Các bước thực hiện, kèm code snippet
3. **Ràng buộc (Constraints)** — Điều kiện, quyền hạn, edge cases
4. **Scripts** — Code chính (component + store)
5. **References** — Types + API endpoints

---

## Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Copy file .env
cp .env.example .env.local

# 3. Chạy development server
npm run dev

# 4. Mở trình duyệt
# http://localhost:3000
```

## Environment Variables cần thiết

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```
