# CLAUDE.md — Hệ thống Việc Làm 24h

## Tổng quan dự án

Hệ thống **Việc Làm 24h** là nền tảng tuyển dụng & freelance kết nối ứng viên, freelancer và nhà tuyển dụng (HR).

### 3 thành phần chính

| Thành phần | Công nghệ | Port |
|---|---|---|
| **Backend** | Spring Boot 3.2.5 (Java 17) | 8080 |
| **Frontend User** | Next.js 16.1.6 (Pages Router) | 3000 |
| **Admin Dashboard** | React 18 + Vite + Ant Design | 5173 |

### Các loại tài khoản

- `job_seeker` — Ứng viên tìm việc
- `freelancer` — Người làm freelance
- `hr` — Nhà tuyển dụng
- `admin` — Quản trị viên
- `super_admin` — Quản trị cao cấp (không thể bị khóa)

---

## Luồng kiến trúc

```
Request → JwtAuthenticationFilter → Controller → UseCase → Repository → Response DTO
```

### Backend (Spring Boot)
- **Clean Architecture:** domain / application / infrastructure / presentation
- **Auth:** Google OAuth, GitHub OAuth, Facebook OAuth, Password (AES-256-GCM)
- **Database:** MySQL (jdbc:mysql://localhost:3306/hovan) + Redis
- **Security:** JWT, Token Blacklist (Redis), Rate Limit (Redis + Bucket4j)
- **API Base:** http://hovan.online/api

### Frontend User (Next.js)
- **State:** Zustand (global) + TanStack React Query (server state)
- **Auth:** OAuth flow, Token refresh interceptor
- **UI:** Ant Design 6.2.3 + Tailwind CSS 4

### Admin Dashboard (React)
- **State:** Zustand + localStorage persist
- **UI:** Ant Design 5.x + Inter font
- **Theme:** Primary green (#16a34a)

---

## Nghiệp vụ chính

### Backend API Groups
1. **Auth** — Google/GitHub/Facebook OAuth, Password login, JWT refresh/rotate, Logout
2. **Users** — CRUD, avatar upload, location update
3. **Jobs** — CRUD, search, comments, saved jobs
4. **Applications** — Apply, status update, interview rounds, confirm
5. **Companies** — CRUD, reviews, images, saved companies
6. **Blog** — CRUD, platform/company blogs
7. **Chat** — Conversations, messages, notifications, admin monitor
8. **Freelance** — Projects, milestones, applications, escrow deposit
9. **CV** — Upload, visibility, access tokens, secure view
10. **Notifications** — Create, mark read, unread count
11. **Domains & Industries** — CRUD, toggle status

### Frontend Pages
- `/` — Trang chủ
- `/login` — OAuth login
- `/jobs`, `/jobs/:id` — Tìm & ứng tuyển việc làm
- `/companies`, `/company/:id` — Công ty
- `/blog`, `/blog/:id` — Blog
- `/profile` — Hồ sơ cá nhân
- `/chat`, `/chat/:id` — Chat
- `/my-applications` — Đơn ứng tuyển
- `/saved-items` — Việc đã lưu
- `/cv-builder` — Tạo CV

### Admin Pages
- Dashboard, User Management, Domain Management, Blog Management, Chat Monitor

---

## Công việc thường gặp

### Chạy dự án
```bash
# Backend (cần Java 17, MySQL, Redis)
cd d:/DOANJ2/bankend_hovan_J2
mvn spring-boot:run

# Frontend User
cd d:/DOANJ2/hove_giao_dien_users
npm run dev

# Admin Dashboard
cd d:/DOANJ2/admin
pnpm dev
```

### Kiểm tra API
- Swagger UI: http://hovan.online/api/swagger-ui.html
- Health: http://hovan.online/api/health

---

## Các file quan trọng

- `d:/DOANJ2/TONG_HOP_LOGIC_NGHIEP_VU.md` — Tổng hợp logic nghiệp vụ đầy đủ
- `d:/DOANJ2/bankend_hovan_J2/src/main/resources/application.yml` — Cấu hình backend
- `d:/DOANJ2/hove_giao_dien_users/lib/api.ts` — Axios interceptor + auth
- `d:/DOANJ2/admin/src/shared/api/httpClient.ts` — Admin HTTP client

---

## Quy ước quan trọng

- **Backend User:** Tài khoản tạo bởi admin, password mã hóa AES-256-GCM
- **Admin email mặc định:** `doan44503@gmail.con` / `123`
- **JWT:** Access token 1 ngày, Refresh token 7 ngày
- **Polling:** Chat 3s, Notifications 2 phút
- **CV Security:** Token 1 lần, auto-invalidate khi tab đóng
