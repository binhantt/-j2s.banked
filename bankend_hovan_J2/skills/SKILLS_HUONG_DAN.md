# 🎯 HƯỚNG DẪN SỬ DỤNG SKILLS - BACKEND

## Tổng quan

Skills là bộ tài liệu **hướng dẫn code** cho backend Spring Boot. Mỗi skill chứa:
- **SKILL.md** — Mô tả nghiệp vụ + ràng buộc
- **scripts/** — Code mẫu (Controller, Service)
- **references/** — Entity, DTO, API endpoint

---

## ⚡ STARTUP NHANH

### 1. Chạy Backend
```bash
cd d:/DOANJ2/bankend_hovan_J2
mvn spring-boot:run
```

### 2. Chạy Admin Dashboard
```bash
cd d:/DOANJ2/admin
pnpm dev
```

### 3. Đăng nhập Admin
- Email: `doan44503@gmail.com`
- Password: `123`

---

## 📂 CẤU TRÚC SKILLS

```
skills/
├── README.md                          ← Danh sách tất cả skills
├── shared/                            ← Kiến trúc chung
│   └── architecture.md
└── features/
    ├── users/        (6 skills)       ← Quản lý tài khoản
    ├── domains/      (6 skills)       ← Quản lý lĩnh vực
    ├── blog/         (4 skills)       ← Quản lý blog
    ├── chat/         (2 skills)       ← Giám sát chat
    ├── companies/    (5 skills)       ← Quản lý công ty
    ├── jobs/         (6 skills)       ← Quản lý tin tuyển dụng
    └── applications/ (5 skills)       ← Quản lý đơn ứng tuyển
```

---

## 🔢 DANH SÁCH SKILLS CHI TIẾT

### US — Users (Quản lý tài khoản)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Xem danh sách tài khoản | `users/01-danh-sach-tai-khoan/SKILL.md` |
| 02 | Bật/Tắt tài khoản | `users/02-bat-tat-tai-khoan/SKILL.md` |
| 03 | Tạo tài khoản | `users/03-tao-tai-khoan/SKILL.md` |
| 04 | Chỉnh sửa tài khoản | `users/04-chinh-sua-tai-khoan/SKILL.md` |
| 05 | Thay đổi vai trò | `users/05-thay-doi-vai-tro/SKILL.md` |

### DM — Domains (Quản lý lĩnh vực)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Xem danh sách lĩnh vực | `domains/01-danh-sach-linh-vuc/SKILL.md` |
| 02 | Xem chi tiết lĩnh vực | `domains/02-chi-tiet-linh-vuc/SKILL.md` |
| 03 | Tạo lĩnh vực | `domains/03-tao-linh-vuc/SKILL.md` |
| 04 | Chỉnh sửa lĩnh vực | `domains/04-chinh-sua-linh-vuc/SKILL.md` |
| 05 | Bật/Tắt trạng thái | `domains/05-bat-tat-trang-thai/SKILL.md` |
| 06 | Xóa lĩnh vực | `domains/06-xoa-linh-vuc/SKILL.md` |

### BL — Blog (Quản lý blog)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Xem danh sách bài viết | `blog/01-danh-sach-bai-viet/SKILL.md` |
| 02 | Xem chi tiết bài viết | `blog/02-chi-tiet-bai-viet/SKILL.md` |
| 03 | Tạo bài viết | `blog/03-tao-bai-viet/SKILL.md` |
| 04 | Xóa bài viết | `blog/04-xoa-bai-viet/SKILL.md` |

### CH — Chat (Giám sát chat)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Danh sách cuộc trò chuyện | `chat/01-danh-sach-cuoc-tro-chuyen/SKILL.md` |
| 02 | Xem tin nhắn | `chat/02-xem-tin-nhan/SKILL.md` |

### CP — Companies (Quản lý công ty)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Danh sách công ty | `companies/01-danh-sach-cong-ty/SKILL.md` |
| 02 | Chi tiết công ty | `companies/02-chi-tiet-cong-ty/SKILL.md` |
| 03 | Tạo công ty | `companies/03-tao-cong-ty/SKILL.md` |
| 04 | Chỉnh sửa công ty | `companies/04-chinh-sua-cong-ty/SKILL.md` |
| 05 | Xóa công ty | `companies/05-xoa-cong-ty/SKILL.md` |

### JB — Jobs (Quản lý tin tuyển dụng)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Danh sách công việc | `jobs/01-danh-sach-cong-viec/SKILL.md` |
| 02 | Chi tiết công việc | `jobs/02-chi-tiet-cong-viec/SKILL.md` |
| 03 | Tạo công việc | `jobs/03-tao-cong-viec/SKILL.md` |
| 04 | Chỉnh sửa công việc | `jobs/04-chinh-sua-cong-viec/SKILL.md` |
| 05 | Bật/Tắt trạng thái | `jobs/05-bat-tat-trang-thai/SKILL.md` |
| 06 | Xóa công việc | `jobs/06-xoa-cong-viec/SKILL.md` |

### AP — Applications (Quản lý đơn ứng tuyển)
| # | Skill | File chính |
|---|-------|------------|
| 01 | Danh sách đơn | `applications/01-danh-sach-don/SKILL.md` |
| 02 | Chi tiết đơn | `applications/02-chi-tiet-don/SKILL.md` |
| 03 | Nộp đơn | `applications/03-nop-don/SKILL.md` |
| 04 | Cập nhật trạng thái | `applications/04-cap-nhat-trang-thai/SKILL.md` |
| 05 | Xóa đơn | `applications/05-xoa-don/SKILL.md` |

---

## 📖 CÁCH ĐỌC MỘT SKILL

### Bước 1: Đọc SKILL.md
```markdown
## Mô tả
Mô tả nghiệp vụ làm gì

## Tác vụ
1. Task 1
2. Task 2

## Ràng buộc
- Constraint 1
- Constraint 2
```

### Bước 2: Đọc scripts/
Xem code mẫu Controller, Service để implement

### Bước 3: Đọc references/
Xem Entity, DTO, API endpoint để hiểu data model

---

## 🎨 VÍ DỤ: Tạo skill mới cho "Quản lý công ty"

```
skills/features/companies/
├── README.md
├── 01-danh-sach-cong-ty/
│   ├── SKILL.md              ← Mô tả
│   ├── scripts/controller.md  ← Code controller
│   └── references/
│       ├── entity-dto.md     ← Entity, DTO
│       └── endpoints.md      ← API endpoints
├── 02-chi-tiet-cong-ty/
│   └── ...
```

---

## 🛠️ COMMANDS

| Command | Mô tả |
|---------|-------|
| `/fix-issue` | Sửa lỗi cụ thể |
| `/review` | Code review |
| `/deploy` | Deploy hệ thống |

---

## 📍 VỊ TRÍ QUAN TRỌNG

| File | Đường dẫn |
|------|-----------|
| Skills README | `d:/DOANJ2/bankend_hovan_J2/skills/README.md` |
| Tổng hợp nghiệp vụ | `d:/DOANJ2/TONG_HOP_LOGIC_NGHIEP_VU.md` |
| Hướng dẫn Admin | `d:/DOANJ2/HUONG_DAN_SU_DUNG_ADMIN.md` |
| Backend Config | `d:/DOANJ2/bankend_hovan_J2/src/main/resources/application.yml` |

---

## 🔐 VAI TRÒ TRONG HỆ THỐNG

| Vai trò | Mô tả |
|---------|-------|
| `job_seeker` | Ứng viên tìm việc |
| `freelancer` | Người làm freelance |
| `hr` | Nhà tuyển dụng |
| `admin` | Quản trị viên |
| `super_admin` | Quản trị cao cấp (không thể bị khóa) |

---

## 🌐 API ENDPOINTS

- **Base URL:** `http://localhost:8080/api`
- **Swagger UI:** `http://localhost:8080/api/swagger-ui.html`
- **Health Check:** `http://localhost:8080/api/health`
