# API Reference

Tài liệu tham khảo API cho dự án Hove Giao Dien Users.

## Base URL

```
Development: http://localhost:8080
Production:  https://api.vieclam24h.com
```

## Authentication

Tất cả API requests cần gắn token vào header:

```http
Authorization: Bearer {token}
```

Token được lưu trong localStorage và tự động refresh khi hết hạn.

---

## Auth APIs

### POST /api/auth/google
Đăng nhập Google OAuth

```json
// Request
{
  "idToken": "google_id_token",
  "userType": "job_seeker" | "freelancer" | "hr"
}

// Response
{
  "userId": 1,
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "avatarUrl": "https://...",
  "userType": "job_seeker",
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /api/auth/github
Đăng nhập GitHub OAuth

```json
// Request
{
  "code": "github_oauth_code",
  "userType": "job_seeker" | "freelancer" | "hr"
}

// Response - Same as Google login
```

### POST /api/auth/facebook
Đăng nhập Facebook OAuth

```json
// Request
{
  "accessToken": "facebook_access_token",
  "userType": "job_seeker" | "freelancer" | "hr"
}

// Response - Same as Google login
```

### POST /api/auth/refresh
Refresh token khi hết hạn

```json
// Request
{
  "refreshToken": "refresh_token"
}

// Response
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

---

## Jobs APIs

### GET /api/jobs
Lấy danh sách việc làm

```json
// Query params
{
  "page": 1,
  "limit": 20,
  "search": "react developer",
  "location": "ho chi minh",
  "type": "full-time",
  "salary_min": 1000,
  "salary_max": 5000
}

// Response
{
  "jobs": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### GET /api/jobs/{id}
Chi tiết việc làm

```json
// Response
{
  "id": 1,
  "title": "Senior React Developer",
  "description": "...",
  "requirements": "...",
  "salaryMin": 1000,
  "salaryMax": 2000,
  "location": "Ho Chi Minh City",
  "companyId": 1,
  "companyName": "Tech Company",
  "companyLogo": "https://...",
  "deadline": "2024-12-31",
  "status": "active",
  "interviewRounds": 3,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### POST /api/jobs
Tạo việc làm mới (HR only)

```json
// Request
{
  "title": "Senior React Developer",
  "description": "...",
  "requirements": "...",
  "salaryMin": 1000,
  "salaryMax": 2000,
  "location": "Ho Chi Minh City",
  "jobType": "full-time",
  "deadline": "2024-12-31",
  "interviewRounds": 3
}

// Response
{
  "id": 1,
  "status": "active",
  "message": "Job created successfully"
}
```

### PUT /api/jobs/{id}
Cập nhật việc làm (HR only)

### DELETE /api/jobs/{id}
Xóa việc làm (HR only)

---

## Companies APIs

### GET /api/companies
Danh sách công ty

```json
// Query params
{
  "page": 1,
  "limit": 20,
  "search": "tech company",
  "industry": "technology"
}

// Response
{
  "companies": [...],
  "total": 50
}
```

### GET /api/companies/{id}
Chi tiết công ty

```json
// Response
{
  "id": 1,
  "name": "Tech Company",
  "description": "...",
  "logo": "https://...",
  "banner": "https://...",
  "website": "https://techcompany.com",
  "industry": "Technology",
  "companySize": "100-500",
  "address": "Ho Chi Minh City",
  "foundedYear": 2020
}
```

### GET /api/companies/{id}/reviews
Đánh giá công ty

---

## Blog APIs

### GET /api/blogs
Danh sách bài blog

```json
// Query params
{
  "page": 1,
  "category": "Kỹ năng",
  "search": "react"
}
```

### GET /api/blogs/{id}
Chi tiết blog

### POST /api/blogs
Tạo blog mới (HR only)

### PUT /api/blogs/{id}
Cập nhật blog (HR only)

### DELETE /api/blogs/{id}
Xóa blog (HR only)

---

## Applications APIs

### POST /api/applications
Ứng tuyển công việc

```json
// Request
{
  "jobPostingId": 1,
  "userId": 1,
  "coverLetter": "Xin chào..."
}

// Response
{
  "id": 1,
  "status": "pending",
  "message": "Application submitted successfully"
}
```

### GET /api/applications/user/{userId}
Danh sách đơn ứng tuyển của user

### GET /api/applications/job/{jobId}
Danh sách ứng viên (HR only)

### PUT /api/applications/{id}/status
Cập nhật trạng thái đơn (HR only)

```json
// Request
{
  "status": "accepted" | "rejected" | "reviewing",
  "currentRound": 1
}
```

### PUT /api/applications/{id}/confirm
Xác nhận đi làm (User)

### DELETE /api/applications/{id}
Hủy đơn ứng tuyển

---

## Chat APIs

### GET /api/chat/conversations/hr/{hrId}
Danh sách cuộc trò chuyện của HR

### GET /api/chat/conversations/user/{userId}
Danh sách cuộc trò chuyện của user

### GET /api/chat/messages/{conversationId}
Tin nhắn trong cuộc trò chuyện

### POST /api/chat/messages
Gửi tin nhắn

```json
// Request
{
  "conversationId": 1,
  "senderId": 1,
  "senderType": "hr" | "job_seeker",
  "message": "Hello!",
  "replyToMessageId": 5  // optional
}
```

### PUT /api/chat/read/{conversationId}
Đánh dấu đã đọc

---

## Freelance APIs

### GET /api/freelance/projects
Danh sách dự án freelance

### GET /api/freelance/projects/{id}
Chi tiết dự án

### POST /api/freelance/projects
Tạo dự án mới

### POST /api/freelance/applications
Ứng tuyển dự án

### PUT /api/freelance/projects/{id}/progress
Cập nhật tiến độ

---

## Profile APIs

### GET /api/users/{id}
Thông tin user

### PUT /api/users/{id}
Cập nhật thông tin user

```json
// Request
{
  "name": "Nguyen Van A",
  "phone": "0912345678",
  "bio": "...",
  "currentPosition": "Senior Developer",
  "hometown": "Hanoi",
  "currentLocation": "Ho Chi Minh",
  "certificateImages": "https://..."
}
```

### GET /api/users/{id}/job-seeker-profile
Profile ứng viên

### PUT /api/users/{id}/job-seeker-profile
Cập nhật job seeker profile

### GET /api/domains
Danh sách lĩnh vực

### GET /api/industries
Danh sách ngành nghề

---

## Saved Items APIs

### GET /api/saved-jobs/user/{userId}
Việc đã lưu

### POST /api/saved-jobs
Lưu việc

### DELETE /api/saved-jobs/{id}
Bỏ lưu việc

### GET /api/saved-companies/user/{userId}
Công ty đã lưu

### POST /api/saved-companies
Lưu công ty

### DELETE /api/saved-companies/{id}
Bỏ lưu công ty

---

## Notification APIs

### GET /api/notifications/unread/{userId}
Danh sách thông báo chưa đọc

### GET /api/notifications/unread/count/{userId}
Số thông báo chưa đọc

### PUT /api/notifications/{id}/read
Đánh dấu đã đọc

### PUT /api/notifications/read-all/{userId}
Đánh dấu đã đọc tất cả

---

## Upload APIs

### POST /api/upload/image
Upload ảnh

```http
POST /api/upload/image
Content-Type: multipart/form-data

file: [image file]
```

```json
// Response
{
  "url": "https://cdn.example.com/images/xxx.jpg"
}
```

---

## Error Responses

```json
// 400 Bad Request
{
  "error": "Validation failed",
  "message": "Email không hợp lệ"
}

// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Token đã hết hạn"
}

// 403 Forbidden
{
  "error": "Forbidden",
  "message": "Bạn không có quyền thực hiện thao tác này"
}

// 404 Not Found
{
  "error": "Not Found",
  "message": "Không tìm thấy tài nguyên"
}

// 500 Internal Server Error
{
  "error": "Internal Server Error",
  "message": "Đã xảy ra lỗi server"
}
```

---

## Rate Limiting

- Default: 100 requests/phút
- Auth APIs: 10 requests/phút
- Upload APIs: 20 requests/phút

Response khi bị rate limit (429):
```json
{
  "error": "Too Many Requests",
  "message": "Vui lòng thử lại sau"
}
```
