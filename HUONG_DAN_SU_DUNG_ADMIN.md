# 📚 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG VIỆC LÀM 24H - ADMIN DASHBOARD

## 📁 Cấu trúc dự án

```
d:/DOANJ2/
├── .claude/                    # Cấu hình Claude Code
│   ├── README.md              # File hướng dẫn chính (bạn đang đọc)
│   ├── settings.json          # Cấu hình permissions
│   ├── CLAUDE.md              # Mô tả toàn dự án
│   ├── agents/                # Định nghĩa Agent tùy chỉnh
│   └── commands/              # Slash commands
│
├── bankend_hovan_J2/          # Backend Spring Boot (Java 17)
│   ├── skills/                # TÀI LIỆU HƯỚNG DẪN CODE
│   │   ├── README.md          # Danh sách tất cả skills
│   │   ├── shared/            # Kiến trúc chung
│   │   └── features/          # Skills theo feature
│   │       ├── users/         # Quản lý tài khoản (6 skills)
│   │       ├── domains/       # Quản lý lĩnh vực (6 skills)
│   │       ├── blog/          # Quản lý blog (4 skills)
│   │       ├── chat/          # Giám sát chat (2 skills)
│   │       ├── companies/     # Quản lý công ty (5 skills)
│   │       ├── jobs/          # Quản lý tin tuyển dụng (6 skills)
│   │       └── applications/  # Quản lý đơn ứng tuyển (5 skills)
│   └── src/                   # Source code backend
│
├── hove_giao_dien_users/      # Frontend User (Next.js)
├── admin/                      # Admin Dashboard (React + Vite)
│   ├── src/
│   │   ├── App.tsx            # Router chính
│   │   ├── shared/
│   │   │   ├── api/httpClient.ts  # HTTP client
│   │   │   ├── layout/AdminLayout.tsx  # Layout chính
│   │   │   └── theme/         # Theme config
│   │   └── features/
│   │       ├── auth/          # Login, auth store
│   │       ├── dashboard/     # Dashboard page
│   │       ├── users/         # Quản lý users
│   │       ├── domains/       # Quản lý domains
│   │       ├── blog/          # Quản lý blog
│   │       └── chat/          # Giám sát chat
│   └── package.json
│
└── TONG_HOP_LOGIC_NGHIEP_VU.md  # Tổng hợp logic nghiệp vụ
```

---

## 🚀 CHẠY HỆ THỐNG

### 1. Backend (Spring Boot)
```bash
cd d:/DOANJ2/bankend_hovan_J2
mvn spring-boot:run
```
- **Port:** 8080
- **API Base:** http://localhost:8080/api
- **Swagger:** http://localhost:8080/api/swagger-ui.html
- **Yêu cầu:** Java 17, MySQL, Redis

### 2. Admin Dashboard
```bash
cd d:/DOANJ2/admin
pnpm dev
```
- **Port:** 5173
- **URL:** http://localhost:5173

### 3. Frontend User (Next.js)
```bash
cd d:/DOANJ2/hove_giao_dien_users
npm run dev
```
- **Port:** 3000
- **URL:** http://localhost:3000

---

## 🔐 ĐĂNG NHẬP ADMIN

| Email | Password | Vai trò |
|-------|----------|---------|
| `doan44503@gmail.com` | `123` | Admin |

---

## 📋 CHỨC NĂNG CHÍNH TRONG ADMIN

### 1. Bảng điều khiển (Dashboard)
- Tổng quan số liệu: users, jobs, applications, blog posts
- Thống kê biểu đồ

### 2. Quản lý Người dùng (Users)
- Xem danh sách tài khoản
- Tạo tài khoản mới
- Bật/Tắt tài khoản
- Chỉnh sửa thông tin
- Thay đổi vai trò

### 3. Quản lý Lĩnh vực (Domains)
- Xem danh sách lĩnh vực
- Tạo lĩnh vực mới
- Chỉnh sửa lĩnh vực
- Bật/Tắt trạng thái
- Xóa lĩnh vực

### 4. Quản lý Blog
- Xem danh sách bài viết
- Tạo bài viết mới
- Xóa bài viết

### 5. Giám sát Chat
- Xem danh sách cuộc trò chuyện
- Xem tin nhắn

---

## 🛠️ CÁCH SỬ DỤNG SKILLS (BACKEND)

### Cấu trúc một Skill
```
skills/features/<feature>/
├── <so>-<ten-skill>/
│   ├── SKILL.md              ← Mô tả skill (BẮT BUỘC)
│   ├── scripts/              ← Code mẫu (controller, service)
│   └── references/           ← Entity, DTO, endpoint reference
```

### Danh sách Skills đầy đủ

| Prefix | Feature | Số lượng | Skills |
|--------|---------|----------|--------|
| US | Users | 6 | Danh sách, Bật/Tắt, Tạo, Sửa, Đổi vai trò |
| DM | Domains | 6 | Danh sách, Chi tiết, Tạo, Sửa, Bật/Tắt, Xóa |
| BL | Blog | 4 | Danh sách, Chi tiết, Tạo, Xóa |
| CH | Chat | 2 | DS cuộc trò chuyện, Xem tin nhắn |
| CP | Companies | 5 | Danh sách, Chi tiết, Tạo, Sửa, Xóa |
| JB | Jobs | 6 | Danh sách, Chi tiết, Tạo, Sửa, Bật/Tắt, Xóa |
| AP | Applications | 5 | Danh sách, Chi tiết, Nộp, Cập nhật, Xóa |

### Cách đọc Skills

1. **Đọc SKILL.md** — Mô tả nghiệp vụ, ràng buộc, input/output
2. **Đọc scripts/** — Code mẫu cho Controller, Service
3. **Đọc references/** — Entity, DTO, API endpoint

---

## 🎯 CÁC SLASH COMMANDS

| Command | Mô tả |
|---------|-------|
| `/fix-issue` | Sửa lỗi cụ thể (báo lỗi + steps to reproduce) |
| `/review` | Code review |
| `/deploy` | Triển khai hệ thống |

---

## 📝 VÍ DỤ SỬ DỤNG

### Sửa lỗi
```
/fix-issue Lỗi 500 khi gọi API /api/jobs/search
```

### Tạo tính năng mới (ví dụ: quản lý công ty)
1. Đọc `skills/features/companies/01-danh-sach-cong-ty/SKILL.md`
2. Đọc `skills/features/companies/01-danh-sach-cong-ty/scripts/controller.md`
3. Đọc `skills/features/companies/01-danh-sach-cong-ty/references/entity-dto.md`
4. Implement theo hướng dẫn

---

## 🔧 CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ |
|------------|-----------|
| Backend | Spring Boot 3.2.5, Java 17 |
| Frontend User | Next.js 14 (Pages Router) |
| Admin | React 18, Vite, Ant Design 5 |
| Database | MySQL |
| Cache | Redis |
| Auth | JWT, OAuth (Google, GitHub, Facebook) |

---

## 📞 HỖ TRỢ

- **Swagger API:** http://hovan.online/api/swagger-ui.html
- **Tài liệu nghiệp vụ:** `d:/DOANJ2/TONG_HOP_LOGIC_NGHIEP_VU.md`
- **Skills Backend:** `d:/DOANJ2/bankend_hovan_J2/skills/README.md`
