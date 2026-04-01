# TỔNG HỢP LOGIC NGHIỆP VỤ — HỆ THỐNG VIỆC LÀM 24H

> **Ngày tạo:** 30/03/2026
> **3 dự án:** Backend (Spring Boot) | Frontend User (Next.js) | Admin Dashboard (React + Vite)

---

## MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Backend — Spring Boot](#2-backend--spring-boot)
   - 2.1 Kiến trúc & Cấu hình
   - 2.2 Nghiệp vụ Authentication
   - 2.3 Nghiệp vụ Người dùng & Hồ sơ
   - 2.4 Nghiệp vụ Việc làm (Job Posting)
   - 2.5 Nghiệp vụ Đơn ứng tuyển (Application)
   - 2.6 Nghiệp vụ Công ty (Company)
   - 2.7 Nghiệp vụ Blog
   - 2.8 Nghiệp vụ Chat
   - 2.9 Nghiệp vụ Freelance
   - 2.10 Nghiệp vụ CV
   - 2.11 Nghiệp vụ Thông báo (Notification)
   - 2.12 Nghiệp vụ Domain & Industry
   - 2.13 Bảo mật & Rate Limit
3. [Frontend User — Next.js](#3-frontend-user--nextjs)
   - 3.1 Auth & OAuth
   - 3.2 Trang chủ & Tìm kiếm việc làm
   - 3.3 Chi tiết & Ứng tuyển việc làm
   - 3.4 Quản lý Công ty
   - 3.5 Quản lý Hồ sơ cá nhân
   - 3.6 Chat
   - 3.7 Freelance
   - 3.8 CV Builder & Quản lý CV
   - 3.9 Lưu trữ (Saved Items)
4. [Admin Dashboard — React](#4-admin-dashboard--react)
   - 4.1 Auth & Layout
   - 4.2 Quản lý Người dùng
   - 4.3 Quản lý Domain
   - 4.4 Quản lý Blog
   - 4.5 Giám sát Chat

---

## 1. TỔNG QUAN HỆ THỐNG

```
Người dùng (Ứng viên / Freelancer / HR)
         │
         ▼
┌─────────────────────────────┐
│   Frontend User (Next.js)   │  ← hove_giao_dien_users
│   Port: 3000 (dev)          │
└────────────┬────────────────┘
             │ HTTP API
             ▼
┌─────────────────────────────┐
│  Backend (Spring Boot)      │  ← bankend_hovan_J2
│  http://hovan.online/api   │
│  Port: 8080                 │
│  MySQL + Redis + JWT        │
└────────────┬────────────────┘
             │ HTTP API
             ▼
┌─────────────────────────────┐
│  Admin Dashboard (React)    │  ← admin
│  Quản lý: User, Domain,      │
│  Blog, Chat                  │
└─────────────────────────────┘
```

### Các loại tài khoản (userType)
| userType | Vai trò |
|---|---|
| `job_seeker` | Ứng viên tìm việc |
| `freelancer` | Người làm freelance |
| `hr` | Nhà tuyển dụng (HR) |
| `admin` | Quản trị viên |
| `super_admin` | Quản trị cao cấp (không thể bị khóa/deactivate) |

### Luồng dữ liệu chung
```
Request → JwtAuthenticationFilter (validate JWT, check isActive)
        → Controller
        → UseCase (business logic)
        → Repository (Persistence)
        → Response DTO
```

---

## 2. BACKEND — SPRING BOOT

### 2.1 Kiến trúc & Cấu hình

**Package structure (Clean Architecture):**
```
domain/          ← Entities, Repositories (interfaces), Value Objects
application/     ← Use Cases, Services, DTOs
infrastructure/  ← JPA Repositories (Impl), Security, OAuth, Redis, Config
presentation/    ← REST Controllers
```

**Cấu hình chính (`application.yml`):**
- Server: Tomcat, max 500 threads, max-connections 10000
- MySQL: `jdbc:mysql://localhost:3306/hovan` (HikariCP 100 connections)
- Redis: localhost:6379 (Lettuce pool)
- JWT secret: 512-bit, expiry 7 ngày
- OAuth: Google, GitHub, Facebook
- Rate limit groups: google-login (10/min), auth-strict (5/min), auth (10/min), read (200/min), write (20/min)

**Database Init (`DatabaseInitializer`):**
- Tạo bảng `saved_jobs`, thêm cột `encrypted_password` vào `users`
- Tạo tài khoản admin mặc định: `doan44503@gmail.con` / `123` (AES-GCM encrypted)

**CORS:** Cho phép tất cả origins, methods, headers

---

### 2.2 Nghiệp vụ Authentication

#### Đăng nhập Google (`GoogleLoginUseCase`)
```
1. Verify GIS One Tap JWT (RS256, JWKS from Google)
2. Tìm user theo provider=google + providerId=sub
3. Nếu chưa có → tạo mới user
4. Kiểm tra isActive (skip cho admin)
5. Tạo JWT access token + refresh token
6. Lưu refresh token vào DB (SHA-256 hash)
```

#### Đăng nhập GitHub (`GitHubLoginUseCase`)
```
1. Exchange code → access_token (GitHub API)
2. Lấy user info + emails (tìm primary email)
3. Fallback: login@github.com nếu không có email
4. Tìm hoặc tạo user theo provider=github + providerId
5. Link accounts by email nếu user đã có email đó
6. Tạo JWT tokens
```

#### Đăng nhập Facebook (`FacebookLoginUseCase`)
```
1. Validate FB token via Graph API /me
2. Lấy id, name, email, picture
3. Fallback: id@facebook.com nếu không có email
4. Tìm hoặc tạo user
5. Tạo JWT tokens
```

#### Đăng nhập Password (`PasswordLoginUseCase`)
```
1. Tìm user theo email
2. Giải mã AES-GCM encrypted_password trong DB
3. So sánh password input với decrypted password
4. Tạo JWT tokens
5. Trả về {banned: true} nếu isActive=false
```

#### Refresh Token (`RefreshTokenService`)
```
- Tạo: SHA-256 hash của token, lưu vào DB với deviceInfo, IP, expiry
- Validate: kiểm tra banned/used/invalid → 403 cho banned
- Rotate: revoke token cũ, tạo token mới
- Revoke: đánh dấu isRevoked=true
- Revoke All: revoke tất cả tokens của user
```

#### JWT (`JwtProvider`)
```
Access Token: JWT (JTI UUID, email, userType, userId)
  → expiry: 1 ngày
Refresh Token: JWT (JTI UUID)
  → expiry: 7 ngày
Blacklist: Redis (TTL = remaining lifetime) + fallback in-memory
```

#### Đăng nhập Admin (`AdminAuthController`)
```
POST /auth/login → PasswordLoginUseCase
  → Kiểm tra userType = ADMIN
  → Trả 403 {banned: true} nếu isActive=false
  → Backend User tạo bởi admin có AES-GCM encrypted password
```

---

### 2.3 Nghiệp vụ Người dùng & Hồ sơ

#### User Entity
```
id, email (unique), name, avatarUrl, provider, providerId,
userType (job_seeker/freelancer/hr/admin), currentPosition,
hometown, currentLocation (lat/lng/address), cvUrl,
certificateImages[], phone, bio, domainId,
encryptedPassword, isActive, createdAt, updatedAt
```

#### Job Seeker Profile
```
userId, phone, location, bio
→ Mỗi user chỉ có 1 profile
→ Tạo mới check trùng lặp
```

#### HR Profile
```
userId, companyName, companySize, industry, website,
address, description
→ Mỗi HR chỉ có 1 profile
→ HR được phép tạo Company (1 HR : 1 Company)
```

#### Profile Controller endpoints:
```
GET/POST /api/profile/job-seeker/{userId}
PUT /api/profile/job-seeker/{id}
GET/POST /api/profile/hr/{userId}
PUT /api/profile/hr/{id}
GET/POST/PUT/DELETE /api/profile/skills/{id}
GET/POST/PUT/DELETE /api/profile/experience/{id}
GET/POST/PUT/DELETE /api/profile/education/{id}
GET/POST/PUT/DELETE /api/profile/cv/{userId}/{id}
```

---

### 2.4 Nghiệp vụ Việc làm (Job Posting)

#### JobPosting Entity
```
id, userId (HR), title, location, salaryMin, salaryMax,
jobType, level, experience, description, requirements,
benefits, deadline, status (active/inactive/closed/draft),
applications (count), maxApplicants, interviewRounds,
views, createdAt, updatedAt
```

#### Nghiệp vụ:
```
Tạo (CreateJobPostingUseCase):
  - status mặc định = "active"
  - interviewRounds mặc định = 1 nếu null

Cập nhật (UpdateJobPostingUseCase):
  - Cập nhật tất cả fields

Xóa (DeleteJobPostingUseCase):
  - Validate tồn tại trước khi xóa

Toggle status:
  - active ↔ inactive
  - HR chỉ xem được job của mình

Tăng view:
  - Mỗi lần GET /jobs/{id} → views++

Search (in-memory filter):
  - searchText (title/description)
  - location
  - jobType
  - salaryMin, salaryMax
  - experience
  - Phân trang + sắp xếp
```

#### Comment (JobComment)
```
- Hỗ trợ threaded comments (parentId)
- Tạo: userId, jobPostingId, content, parentId (optional)
- Xóa: chỉ người tạo hoặc admin
```

#### Saved Job
```
- Lưu/unsave job
- Check exist trước khi save (unique constraint)
- List all saved của user (nested job + company info)
```

---

### 2.5 Nghiệp vụ Đơn Ứng tuyển (Application)

#### JobApplication Entity
```
id, jobPostingId, userId (job_seeker), cvUrl, coverLetter,
status (pending/reviewing/accepted/rejected),
userConfirmed, currentRound, createdAt, updatedAt
```

#### Nghiệp vụ:
```
Ứng tuyển (ApplyJobUseCase):
  1. Check duplicate (jobId + userId đã tồn tại?)
  2. Tự động đóng job nếu đã đạt maxApplicants
  3. Tạo đơn ứng tuyển (status=pending)
  4. Increment job.applications count

Cập nhật trạng thái (UpdateApplicationStatusUseCase):
  - pending → reviewing → accepted/rejected
  - accepted: gửi notification cho ứng viên
  - rejected: gửi notification cho ứng viên
  - Trigger notification via CreateNotificationUseCase

Vòng phỏng vấn:
  - PUT /applications/{id}/round → pass/fail
  - Gửi notification mỗi vòng
  - Khi currentRound >= totalRounds → accepted

Xác nhận đi làm:
  - PUT /applications/{id}/confirm
  - userConfirmed = true
  - Alert ứng viên khi accepted
```

---

### 2.6 Nghiệp vụ Công ty (Company)

#### Company Entity
```
id, hrId, name, logoUrl, domainId, companySize, foundedYear,
website, email, phone, address, description, mission, vision,
values, benefits, workingHours, imageGallery (JSON),
createdAt, updatedAt
```

#### Nghiệp vụ:
```
Tạo (CreateCompanyUseCase):
  - 1 HR chỉ có 1 Company (check hrId)

Cập nhật (UpdateCompanyUseCase):
  - Full field update

Company Blog:
  - Tạo: auto set publishedAt nếu status=published
  - Cập nhật: set publishedAt nếu lần đầu publish

Company Images:
  - Tối đa 20 ảnh/company
  - Type: OFFICE/TEAM/ACTIVITY/GENERAL

Company Reviews:
  - 1 user chỉ đánh giá 1 công ty 1 lần
  - Avg rating + count stats

Saved Company:
  - Save/unsave company
  - Check exist
  - List all saved (nested company info)
```

---

### 2.7 Nghiệp vụ Blog

#### Blog Entity
```
id, title, excerpt, content, author, authorAvatar, category,
image, readTime, views, source (PLATFORM/COMPANY), tags[],
companyId, createdAt, updatedAt
```

#### Nghiệp vụ:
```
CRUD đầy đủ:
  - GET /blog/posts (filter by source)
  - GET /blog/posts/{id} → increment views
  - POST /blog/posts (validated)
  - PUT /blog/posts/{id}
  - DELETE /blog/posts/{id}
  - Search by keyword (title/excerpt)

Company Blog:
  - HR tự tạo blog cho công ty của mình
  - Filter by companyId, hrId, status
  - Delete: HR chỉ xóa blog của công ty mình
```

---

### 2.8 Nghiệp vụ Chat

#### Conversation Entity
```
id, hrId, jobSeekerId, jobPostingId, createdAt, updatedAt
→ Unique: hrId + jobSeekerId + jobPostingId
```

#### ChatMessage Entity
```
id, conversationId, senderId, senderType (hr/job_seeker),
message (TEXT), isRead, replyToMessageId, replyToMessage,
createdAt
```

#### Nghiệp vụ:
```
Tạo conversation (CreateConversationUseCase):
  - Deduplicate: nếu đã có (hr + jobSeeker + jobPosting) → trả về conversation cũ
  - Tạo mới nếu chưa có

Gửi message (SendMessageUseCase):
  1. Lưu message vào DB
  2. Tạo Notification cho người nhận (type: new_message)
  3. Preview = message.substring(0, 50)

Đọc message:
  - PUT /chat/messages/read/{conversationId}/{userId}
  - Đánh dấu tất cả messages trong conversation là isRead=true

Unread count:
  - Đếm messages chưa đọc trong conversation
  - Notification count trong navbar = notifications unread + chat unread

Admin monitor:
  - GET /admin/chat/conversations (all)
  - GET /admin/chat/conversations/{id}/messages
  - Search by userId
```

---

### 2.9 Nghiệp vụ Freelance

#### FreelanceProject Entity
```
id, clientId, freelancerId, title, description,
budget (BigDecimal), depositAmount (20% của budget),
depositStatus (pending/paid), status (draft/open/in_progress/completed/cancelled),
progress (0-100), deadline, createdAt, updatedAt
```

#### ProjectMilestone Entity
```
id, projectId, title, percentage, status (pending/in_progress/completed),
dueDate, createdAt
→ Tổng % tất cả milestones <= 100
```

#### ProjectApplication Entity
```
id, projectId, freelancerId, status, coverLetter,
achievements, cvUrl, proposedPrice, estimatedDuration, createdAt
```

#### Nghiệp vụ:
```
Tạo project:
  - depositAmount = 20% của budget
  - depositStatus = pending
  - status = draft

Đặt cọc (Deposit):
  - POST /freelance/projects/{id}/deposit
  - depositStatus = paid
  - status = open

Ứng tuyển project:
  - Freelancer check đã có certificate_images mới được apply
  - Freelancer chọn CV (auto chọn default)
  - proposedPrice (min 1M VND)
  - estimatedDuration
  - achievements (text)
  - Không cho reapply nếu đã apply trước đó (trừ khi bị rejected)
  - Check deposit đã paid mới cho apply

Cập nhật progress:
  - POST /freelance/projects/{id}/progress
  - Nếu progress >= 100 → status = completed

Milestones:
  - CRUD milestones cho project
  - Delete all when project deleted (transactional)

Stats:
  - totalBudget, totalDeposits
  - counts per status (draft/open/in_progress/completed/cancelled)
```

---

### 2.10 Nghiệp vụ CV

#### UserCV Entity
```
id, userId, title, fileUrl, fileName, fileSize,
isDefault, visibility (private/public/application_only),
createdAt, updatedAt
```

#### CVAccessToken Entity
```
id, token (UUID), cvId, viewerId, viewerType (owner/hr),
expiredAt, used (boolean)
```

#### Nghiệp vụ:
```
Upload CV:
  - Lưu file vào filesystem (/uploads/cv/)
  - Lưu metadata vào DB
  - Tự động set là default nếu là CV đầu tiên
  - visibility mặc định = private

Set Default:
  - Unset tất cả isDefault = false cho user
  - Set target CV isDefault = true

Visibility:
  - private: chỉ owner xem được
  - public: ai cũng xem được (qua share link)
  - application_only: HR đã nhận được đơn ứng tuyển của user

Generate Access Token:
  - Token 1 lần sử dụng
  - Server invalidate ngay sau khi xem
  - Owner access: 30s TTL
  - HR access: 30 phút TTL
  - Embed access: cho iframe

CV Security (Frontend TokenManager):
  - Lưu token trong sessionStorage
  - Event listeners: visibilitychange, pagehide, beforeunload, blur
  - Tự động gọi invalidate khi tab đóng

HR xem CV ứng viên:
  - HR đã nhận đơn ứng tuyển (application từ user đó)
  - Hoặc dùng CV access token

Delete CV:
  - Xóa file filesystem + DB record
```

---

### 2.11 Nghiệp vụ Thông báo (Notification)

#### Notification Entity
```
id, userId, type, title, message,
relatedEntityType, relatedEntityId,
isRead, createdAt, readAt
```

#### Nghiệp vụ:
```
Tạo notification (CreateNotificationUseCase):
  - Khi: apply thành công, accepted/rejected, interview round, new message chat
  - Lưu: userId, type, title, message, relatedEntity

Đọc notification:
  - PUT /notifications/{id}/read
  - PUT /notifications/user/{userId}/read-all (JPQL @Modifying)
  - readAt = now, isRead = true

Count unread:
  - Notification unread count
  - Chat unread count (tất cả conversations)
  - Total = notification + chat unread

Navbar count:
  - GET /notifications/user/{userId}/navbar-count
  - Trả về tổng unread = notifications + all conversation unread
```

---

### 2.12 Nghiệp vụ Domain & Industry

#### Domain Entity
```
id, name, description, isActive, jobCount, createdAt, updatedAt
```

#### Industry Entity
```
id, name (unique), description, isActive, createdAt, updatedAt
```

#### Nghiệp vụ:
```
Domain:
  - CRUD đầy đủ
  - Toggle isActive (PATCH)
  - jobCount: count jobs thuộc domain (qua companies)
  - Không xóa domain nếu có companies đang dùng

Industry:
  - Full CRUD (Admin only)
  - Toggle isActive
  - Unique name validation
  - GET /industries → chỉ active industries
```

---

### 2.13 Bảo mật & Rate Limit

#### Security Filter Chain
```
JwtAuthenticationFilter:
  - Skip: /api/auth/**
  - Validate JWT signature
  - Check TokenBlacklist (Redis)
  - Check isActive → 403 {banned: true}
  - Set SecurityContext với ROLE_USER_TYPE authority

RateLimitFilter (Redis):
  - Per-IP distributed rate limiting
  - Fallback: Bucket4j in-memory
  - Whitelisted paths skip
  - 429 JSON + Retry-After header

ConnectionLimitFilter:
  - Per-user concurrent request limiter
  - Max 5 requests/user
  - TTL 30s
  - Fail-open on Redis errors
```

#### AES-256-GCM Crypto
```
- Encrypt password: random IV (12 bytes), 128-bit tag, Base64 output
- Decrypt: tách IV, giải mã, verify tag
- Dùng cho: stored password của backend users
```

---

## 3. FRONTEND USER — NEXT.JS

### 3.1 Auth & OAuth

#### Luồng OAuth
```
1. User chọn userType TRƯỚC (job_seeker/freelancer/hr)
2. Click OAuth button (Google/GitHub/Facebook)
3. pendingUserType lưu vào localStorage (cho GitHub redirect)
4. OAuth SDK callback nhận credential
5. Gọi backend API (googleLogin/githubLogin/facebookLogin)
6. Lưu {token, refreshToken, user} vào Zustand store
7. Redirect về /
```

#### Token Refresh (lib/api.ts)
```
Request interceptor:
  - Thêm Bearer token

Response interceptor:
  - Nếu 401 → gọi POST /auth/refresh với refreshToken
  - Retry request gốc với token mới
  - Nếu refresh thất bại → logout + redirect /login
  - Kiểm tra response {banned: true} → hiển thị message
```

#### Protected Route
```
- Route guard kiểm tra user.userType
- Redirect /login nếu chưa đăng nhập
- Redirect / nếu không có quyền
```

---

### 3.2 Trang chủ & Tìm kiếm việc làm

#### HomeFeature
```
- HeroSection: stats (10K+ jobs, 5K+ companies), CTA
- IntroSection: giới thiệu platform
- FeaturesSection: 6 cards (search, apply, notify, verify, career, reviews)
- CtaSection: banner kêu gọi
```

#### JobSearchBar
```
- Debounce 400ms (useDebouncedCallback)
- Gọi API lấy distinct locations để suggest
- SearchText → jobApi.searchJobs()
```

#### JobFilters (Sticky Sidebar)
```
- Checkbox.Group: jobType (Full-time, Part-time, Remote, Freelance, Internship)
- Select: salary range, experience level
- Filter change → gọi store.fetchJobs()
```

#### JobListPage
```
- useJobStore: jobs[], filters, pagination, loading
- JobCard: salary formatter (VND), save toggle, tags, hover lift
- Phân trang: page, size
```

---

### 3.3 Chi tiết & Ứng tuyển việc làm

#### JobDetailFeature
```
- JobDetailHeader: company avatar, salary, apply/save, owner mode
- JobInfoSidebar: HR mode (stats) vs job-seeker mode (info + chat HR button)
- JobDescription: white-space: pre-line
- JobComments: nested replies, time-ago, delete/reply cho owner
```

#### ApplyModal (2 bước)
```
Step 1 - Form:
  - Chọn CV (radio list từ user's CVs)
  - Cover letter textarea
  - Validate: CV bắt buộc

Step 2 - Preview:
  - Preview CV info + cover letter
  - Confirm button

Submit:
  - applicationApi.applyJob({ jobPostingId, cvUrl, coverLetter })
  - Show thành công/thất bại
  - Disable apply button nếu đã ứng tuyển
```

#### Chat từ Job Detail
```
- JobSeeker nhấn "Chat HR" → tạo/retrieve conversation
- Redirect đến /chat/{conversationId}
```

---

### 3.4 Quản lý Công ty

#### CompanyDetailFeature
```
6 tabs:
1. Giới thiệu: description, benefits, workingHours
2. Việc làm: list job postings của công ty (active)
3. Phúc lợi: benefits text
4. Hình ảnh: CompanyImage grid (max 20)
5. Blog: CompanyBlog của công ty
6. Đánh giá: rating, reviews, create/update/delete own review
```

#### CompanyReviewSection
```
- Avg rating + count stats
- Rate (1-5 stars)
- Comment textarea
- 1 review/user/company (update nếu đã đánh giá)
- List reviews (newest first)
```

---

### 3.5 Quản lý Hồ sơ cá nhân

#### ProfileFeature (tab-based)
```
Job Seeker / Freelancer tabs:
  - Thông tin cá nhân (PersonalInfoForm)
  - Kỹ năng (SkillsSection) - CRUD
  - Kinh nghiệm (ExperienceManagement) - CRUD
  - Học vấn (EducationManagement) - CRUD
  - Quản lý CV (CVManagement)
  - Freelance (placeholder)

HR tabs:
  - Thông tin cá nhân
  - Thông tin công ty (CompanyInfoForm)
  - Việc làm đã đăng (JobPostingManagementSection)
  - Blog công ty (BlogManagementSection)
  - Hình ảnh (ImageGalleryManagementSection)
  - Freelance (placeholder)
```

#### PersonalInfoForm
```
- Avatar upload (ImgBB)
- GPS geolocation (navigator.geolocation)
- Domain select (từ domainApi)
- Certificate upload (bắt buộc cho freelancer)
- Bio, phone, currentPosition
```

#### CompanyInfoForm
```
- Logo upload (upload + URL input)
- Company name, size, domain
- Website
- Mission, vision, values (textarea)
- Save → profileApi.updateHRProfile()
```

#### ImageGalleryManagementSection
```
- Upload ≤5MB/image, image/*
- Max 20 images/company
- Preview grid
- Delete individual
- Legacy: imageGallery JSON string fallback
```

---

### 3.6 Chat

#### ChatPage (Split Panel)
```
Sidebar (360px):
  - ConversationsList
  - NotificationBell (unread count)

Main:
  - MessageThread
  - MessageInput
```

#### MessageThread
```
- Gradient sent bubbles (màu xanh gradient)
- White received bubbles
- Reply threading (replyToMessage)
- Image URL detection (auto-link)
- 3-second polling (setInterval)
- Auto scroll to bottom on new message
```

#### Typing Indicator
```
- Hiển thị khi có người đang nhập
- Dựa trên message polling hoặc presence system
```

---

### 3.7 Freelance

#### FreelanceFeature
```
- FreelanceSearch: keyword, budget Select, duration Select
- FreelanceList: 6 mock project grid
```

#### FreelanceDetailFeature
```
- ClientInfoModal: location (Google Maps iframe từ lat/lng), email/phone links
- DepositPaymentCard: gradient bg, total budget, deposit 20%, status, pay button
- ProjectProgressTracker: milestone timeline, progress bar, per-milestone status
- ApplicantsList: HR xem danh sách ứng viên
- ApplyProjectModal: freelancer ứng tuyển
```

#### ApplyProjectModal
```
- Check: freelancer đã có certificate_images?
  → Nếu chưa: show warning, không cho apply
- Auto select default CV
- proposedPrice (min 1M VND)
- estimatedDuration
- coverLetter (min 50 chars)
- achievements text
```

#### DepositPaymentCard
```
- Total: project.budget
- Deposit: 20% = project.depositAmount
- Status: pending → paid (khi HR nhấn pay)
- Pay button → POST /freelance/projects/{id}/deposit
```

---

### 3.8 CV Builder & Quản lý CV

#### CVManagement
```
Upload:
  - PDF/DOC/DOCX, ≤10MB
  - Visibility: private/public/application_only
  - Set as default (star)
  - Share link (generate-view-token cho public CV)

Token-based view (TokenManager):
  - sessionStorage token
  - One-time use
  - Auto-invalidate on tab close/pagehide/blur
  - HRCVViewer: iframe hiển thị PDF
```

#### CVBuilderFeature
```
- Personal info form
- Experience: add/remove entries
- Education: add/remove entries
- Skills: Rate (1-5)
- Preview mode
- Export PDF (TODO)
```

---

### 3.9 Lưu trữ (Saved Items)

#### SavedItemsFeature
```
- Protected route (redirect /login)
- Tabs: "Việc làm" | "Công ty"
- Fetches saved jobs + saved companies
```

#### SavedJobCard
```
- Premium card design
- Salary formatter (VND)
- Heart button → unsave
- Apply button
- Saved date
```

#### SavedCompanyCard
```
- Animated banner
- Blurred logo background
- Heart button → unsave
- Saved date
```

---

## 4. ADMIN DASHBOARD — REACT

### 4.1 Auth & Layout

#### httpClient.ts
```
- Base URL: http://hovan.online/api
- Fetch wrapper
- Throw BannedException nếu response {banned: true}
```

#### AdminLayout
```
- Sidebar (300px): logo, nav menu (Dashboard, Người dùng, Lĩnh vực, Blog, Chat)
- Header: search bar, notification bell, "Bài viết mới" button
- Theme: primary #16a34a (green), borderRadius 10, Inter font
```

#### App.tsx (State-based Router)
```
Views: dashboard | users | domains | blog | blogCreate | chat | analytics | settings
- Unauthenticated → LoginPage
- Authenticated → AdminLayout + current view
```

---

### 4.2 Quản lý Người dùng

#### UserManagementPage
```
Features:
  - List users (paginated, filter by userType)
  - Toggle active/inactive status
  - Create backend user (email, password, role)
  - Update user role
  - Update credentials (email/password)
  - Activate / Deactivate
```

#### API Endpoints:
```
GET /admin/users?page=&size=&userType=
PUT /admin/users/:id/toggle-status
PUT /admin/users/:id/activate
PUT /admin/users/:id/deactivate
POST /admin/users/create
PUT /admin/users/:id/update-role
PUT /admin/users/:id/update-credentials
```

---

### 4.3 Quản lý Domain

#### DomainManagementPage
```
Features:
  - List domains (name, description, isActive, jobCount)
  - DomainStats: stat cards + progress bar (domain health)
  - Create domain modal
  - Edit domain modal
  - Toggle isActive
  - Delete domain (check if has companies)
```

#### API Endpoints:
```
GET /api/domains
GET /api/domains/:id
POST /api/domains
PUT /api/domains/:id
PATCH /api/domains/:id/status (toggle)
DELETE /api/domains/:id
```

---

### 4.4 Quản lý Blog

#### BlogManagementPage
```
Features:
  - List blog posts (title, author, category, views, createdAt)
  - View blog detail
  - Delete post
```

#### BlogCreatePage
```
Form fields:
  - Title, excerpt, content
  - Author, authorAvatar
  - Category, readTime
  - Image URL
  - Tags (comma-separated)
```

#### API Endpoints:
```
GET /api/blog/posts
GET /api/blog/posts/:id
POST /api/blog/posts
DELETE /api/blog/posts/:id
```

---

### 4.5 Giám sát Chat

#### ChatMonitorPage
```
Features:
  - Two-panel layout: conversation list (left) + message viewer (right)
  - List all conversations (paginated, sortable)
  - Search conversations by userId
  - View message history
  - Unread count badges
```

#### API Endpoints:
```
GET /api/admin/chat/conversations?page=&size=&sortBy=&sortDir=
GET /api/admin/chat/conversations/:id/messages?page=&size=
GET /api/admin/chat/conversations/search?userId=&page=&size=
```

---

## BẢNG TỔNG HỢP API ENDPOINTS

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/github` | GitHub OAuth login |
| POST | `/api/auth/facebook` | Facebook OAuth login |
| POST | `/api/auth/login` | Password login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout (blacklist + revoke) |

### Users & Profile
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/users` | List users (paginated) |
| GET | `/api/users/:id` | Get user detail |
| PUT | `/api/users/:id` | Update user |
| POST | `/api/users/:id/avatar` | Upload avatar |
| POST | `/api/users/:id/location` | Update GPS location |
| GET | `/api/profile/job-seeker/:userId` | Get/create job seeker profile |
| PUT | `/api/profile/job-seeker/:id` | Update job seeker profile |
| GET | `/api/profile/hr/:userId` | Get/create HR profile |
| PUT | `/api/profile/hr/:id` | Update HR profile |
| GET | `/api/candidate-profile/:userId` | Full candidate profile (HR view) |

### Jobs
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/jobs` | List/search jobs |
| GET | `/api/jobs/active` | Active jobs |
| GET | `/api/jobs/:id` | Job detail (increment views) |
| POST | `/api/jobs` | Create job (HR) |
| PUT | `/api/jobs/:id` | Update job (HR) |
| PUT | `/api/jobs/:id/toggle-status` | Toggle status |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/jobs/locations` | Distinct locations |
| GET | `/api/jobs/experiences` | Distinct experience levels |

### Applications
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/applications` | Apply for job |
| GET | `/api/applications/job/:jobId` | Applications for job (HR) |
| GET | `/api/applications/user/:userId` | My applications |
| PUT | `/api/applications/:id/status` | Update status |
| PUT | `/api/applications/:id/round` | Pass/fail interview round |
| PUT | `/api/applications/:id/confirm` | Confirm going to work |

### Companies
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/companies` | List companies |
| GET | `/api/companies/:id` | Company detail |
| POST | `/api/companies` | Create company (HR) |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company |
| GET | `/api/company-reviews/company/:companyId` | Reviews + stats |
| POST | `/api/company-reviews` | Create/update review |
| GET | `/api/company-images/company/:companyId` | Company images |
| POST | `/api/company-images` | Add image |

### Blog
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/blog/posts` | List posts (filter by source) |
| GET | `/api/blog/posts/:id` | Post detail |
| POST | `/api/blog/posts` | Create post |
| PUT | `/api/blog/posts/:id` | Update post |
| DELETE | `/api/blog/posts/:id` | Delete post |

### Chat
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/chat/conversations` | Create/get conversation |
| GET | `/api/chat/conversations/hr/:hrId` | HR conversations |
| GET | `/api/chat/conversations/job-seeker/:jobSeekerId` | Job seeker conversations |
| GET | `/api/chat/messages/:conversationId` | Messages |
| POST | `/api/chat/messages` | Send message |
| PUT | `/api/chat/messages/read/:conversationId/:userId` | Mark as read |
| GET | `/api/admin/chat/conversations` | All conversations (admin) |
| GET | `/api/admin/chat/conversations/:id/messages` | Chat history (admin) |

### Freelance
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/freelance/projects` | List projects |
| POST | `/api/freelance/projects` | Create project |
| PUT | `/api/freelance/projects/:id` | Update project |
| POST | `/api/freelance/projects/:id/deposit` | Pay deposit |
| POST | `/api/freelance/projects/:id/progress` | Update progress |
| POST | `/api/freelance/applications` | Apply for project |
| PUT | `/api/freelance/applications/:id/status` | Accept/reject applicant |
| GET | `/api/freelance/milestones/project/:projectId` | Project milestones |
| POST | `/api/freelance/milestones` | Create milestone |

### CV
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/user-cvs` | Upload CV |
| GET | `/api/user-cvs/user/:userId` | User's CVs |
| PUT | `/api/user-cvs/:id/set-default` | Set as default |
| PUT | `/api/user-cvs/:id/privacy` | Update visibility |
| DELETE | `/api/user-cvs/:id` | Delete CV |
| POST | `/api/cv/generate-view-token` | Generate access token |
| POST | `/api/cv/generate-hr-token` | HR access token |
| GET | `/api/cv/view/:token` | View CV with token |

### Notifications
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/notifications/user/:userId` | User notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/user/:userId/read-all` | Mark all read |
| GET | `/api/notifications/user/:userId/count` | Unread count |
| GET | `/api/notifications/user/:userId/navbar-count` | Total unread (notif + chat) |

### Saved Items
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/saved-jobs` | Save job |
| GET | `/api/saved-jobs/user/:userId` | Saved jobs |
| DELETE | `/api/saved-jobs/:userId/:jobId` | Unsave job |
| POST | `/api/saved-companies` | Save company |
| GET | `/api/saved-companies/user/:userId` | Saved companies |
| DELETE | `/api/saved-companies/:userId/:companyId` | Unsave company |

### Domain & Industry
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/domains` | List domains |
| POST | `/api/domains` | Create domain |
| PUT | `/api/domains/:id` | Update domain |
| PATCH | `/api/domains/:id/status` | Toggle status |
| DELETE | `/api/domains/:id` | Delete domain |
| GET | `/api/industries` | Active industries |
| POST | `/api/admin/industries` | Create industry (admin) |
| PUT | `/api/admin/industries/:id` | Update industry (admin) |

---

## CÁC QUY TẮC & RÀNG BUỘC QUAN TRỌNG

### Phân quyền theo userType
```
job_seeker: Xem job, ứng tuyển, xem công ty, chat HR, quản lý profile/CV
freelancer: Giống job_seeker + apply freelance project
hr: Đăng job, xem ứng viên, nhận/đánh giá ứng viên, quản lý company/blog
admin: Quản lý users, domains, blog, giám sát chat
super_admin: Giống admin nhưng không bị khóa được
```

### Validation Rules
```
CV upload: ≤10MB, PDF/DOC/DOCX
Company images: ≤5MB, image/*, max 20/company
Freelance apply: freelancer phải có certificate_images
Freelance price: min 1M VND
Cover letter (freelance): min 50 ký tự
Milestones: tổng % ≤ 100
Password login: AES-GCM decrypt → compare
Domain delete: không xóa được nếu có companies
```

### Rate Limiting
```
google-login: 10 requests/phút/IP
auth-strict: 5 requests/phút/IP
auth: 10 requests/phút/IP
read: 200 requests/phút/IP
write: 20 requests/phút/IP
default: 100 requests/phút/IP
Concurrent per user: max 5 requests, TTL 30s
```

### Polling Intervals
```
Chat messages: 3 giây
Notifications (Navbar): 2 phút
```

---

## CÁC VẤN ĐỀ & LƯU Ý KỸ THUẬT

1. **JJWT version inconsistency:** `pom.xml` dùng 0.12.6, `build.gradle.kts` dùng 0.11.5
2. **Duplicate Notification entity:** 2 file cùng target bảng `notifications`
3. **@Modifying without clearAutomatically:** `markAllAsRead()` JPQL có thể gây stale entity
4. **Admin email typo:** `doan44503@gmail.con` (`.con` thay vì `.com`)
5. **N+1 query risk:** `searchJobs()` gọi `companyRepository.findByHrIdIncludingInactive()` per job
6. **No @Transactional explicit:** `RefreshTokenService` methods sửa DB không có annotation
7. **SavedJob/Company bypass Clean Architecture:** Dùng JPA repository trực tiếp, không qua domain repository
