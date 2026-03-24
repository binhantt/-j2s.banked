# Hove Giao Dien Users

## Mô tả

Dự án **Hove Giao Dien Users** là ứng dụng web quản lý giao diện người dùng cho nền tảng tuyển dụng và việc làm **ViệcLàm24h**. Hỗ trợ 3 loại người dùng: **Ứng viên (job_seeker)**, **Freelancer**, và **Nhà tuyển dụng (HR)**.

## Cấu trúc dự án

```
hove_giao_dien_users/
├── pages/                    ← Next.js Pages Router
│   ├── _app.tsx             ← App wrapper với ConfigProvider + initAuth
│   ├── _document.tsx
│   ├── index.tsx            ← Trang chủ (HomeFeature)
│   ├── login.tsx            ← Trang đăng nhập (OAuth: Google, GitHub, Facebook)
│   │
│   ├── jobs/
│   │   ├── index.tsx        ← Danh sách việc làm
│   │   ├── [id].tsx         ← Chi tiết việc làm
│   │   ├── post.tsx         ← Đăng việc làm (HR only)
│   │   ├── edit/[id].tsx    ← Chỉnh sửa việc làm (HR only)
│   │   ├── my-jobs.tsx      ← Việc làm của tôi (HR only)
│   │   └── saved.tsx        ← Việc đã lưu
│   │
│   ├── companies/
│   │   ├── index.tsx        ← Danh sách công ty
│   │   └── [id].tsx         ← Chi tiết công ty
│   │
│   ├── blog/
│   │   ├── index.tsx        ← Danh sách blog
│   │   ├── [id].tsx         ← Chi tiết blog
│   │   └── blogs/           ← Blog nhà tuyển dụng
│   │
│   ├── company/             ← HR Company Management
│   │   ├── blog.tsx
│   │   ├── blogs/
│   │   └── images.tsx
│   │
│   ├── chat/
│   │   ├── index.tsx        ← Danh sách cuộc trò chuyện
│   │   ├── [id].tsx        ← Chi tiết cuộc trò chuyện
│   │   └── components/
│   │       ├── ConversationsList.tsx    ← Danh sách cuộc trò chuyện
│   │       ├── MessageThread.tsx        ← Luồng tin nhắn
│   │       ├── MessageBubble.tsx        ← Bọt tin nhắn
│   │       ├── MessageInput.tsx         ← Ô nhập tin nhắn
│   │       ├── NotificationBell.tsx     ← Chuông thông báo
│   │       └── TypingIndicator.tsx      ← Trạng thái đang nhập
│   │
│   ├── applications/
│   │   ├── my-applications.tsx ← Đơn ứng tuyển của tôi
│   │   ├── job/[jobId].tsx     ← Ứng viên ứng tuyển vào job
│   │   └── candidate/[applicationId].tsx ← Chi tiết ứng viên (HR)
│   │
│   ├── profile.tsx          ← Trang profile user
│   ├── cv-builder.tsx       ← Tạo CV online
│   ├── saved-items.tsx     ← Việc & công ty đã lưu
│   ├── settings/profile.tsx ← Cài đặt profile
│   └── admin/industries.tsx ← Quản lý ngành nghề
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    ← Route bảo vệ theo userType
│   │
│   ├── layout/
│   │   ├── Navbar.tsx           ← Thanh điều hướng (notifications, user menu)
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx      ← Layout chính
│   │
│   ├── common/
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── PageContainer.tsx
│   │   ├── SectionTitle.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── CompanyInfo.tsx         ← Thông tin công ty
│   ├── CompanyDebugInfo.tsx    ← Debug info công ty
│   ├── LocationTest.tsx        ← Test geolocation
│   ├── DomainDisplay.tsx       ← Hiển thị domain/lĩnh vực
│   ├── JobCompanyBadge.tsx
│   ├── JobCompanyInfo.tsx
│   ├── SaveJobButton.tsx
│   ├── SaveCompanyButton.tsx
│   ├── CVUpload.tsx
│   ├── AvatarUpload.tsx
│   ├── CertificateUpload.tsx
│   ├── CVAccessButton.tsx      ← Nút truy cập CV
│   ├── CVDirectAccessButton.tsx
│   ├── CVOwnerAccessButton.tsx
│   ├── HRCVAccessButton.tsx
│   └── HRCVViewer.tsx          ← HR xem CV ứng viên
│
├── features/
│   ├── home/                   ← Trang chủ
│   │   ├── index.tsx           ← HomeFeature
│   │   └── components/
│   │       ├── HeroSection.tsx
│   │       ├── IntroSection.tsx
│   │       ├── FeaturesSection.tsx
│   │       └── CtaSection.tsx
│   │
│   ├── auth/                   ← Đăng nhập
│   │   └── LoginFeature.tsx   ← Full login UI với OAuth + UserTypeModal
│   │
│   ├── jobs/                   ← Tính năng việc làm
│   │   ├── index.tsx          ← JobsFeature (danh sách + search)
│   │   ├── JobsListPage.tsx   ← Trang danh sách jobs
│   │   ├── JobDetailFeature.tsx ← Chi tiết job
│   │   ├── PostJobPage.tsx    ← Đăng tin (HR)
│   │   ├── SavedJobsPage.tsx
│   │   ├── api/
│   │   │   ├── jobApi.ts
│   │   │   └── jobDetailApi.ts
│   │   ├── store/
│   │   │   ├── useJobStore.ts
│   │   │   └── useJobDetailStore.ts
│   │   └── components/
│   │       ├── JobCard.tsx
│   │       ├── JobSearchBar.tsx
│   │       ├── JobFilters.tsx
│   │       ├── JobDescription.tsx
│   │       ├── JobDetailHeader.tsx
│   │       ├── JobInfoSidebar.tsx
│   │       ├── JobComments.tsx
│   │       └── ApplyModal.tsx
│   │
│   ├── companies/              ← Tính năng công ty
│   │   ├── index.tsx          ← CompaniesFeature
│   │   ├── CompanyDetailFeature.tsx
│   │   ├── CompanyReviewSection.tsx
│   │   ├── api/companyApi.ts
│   │   ├── store/
│   │   │   ├── useCompanyStore.ts
│   │   │   └── useCompanyDetailStore.ts
│   │   └── components/
│   │       ├── CompanyCard.tsx
│   │       ├── CompanyList.tsx
│   │       └── CompanySearch.tsx
│   │
│   ├── blog/                  ← Blog & tin tức
│   │   ├── index.tsx          ← BlogFeature (platform blog + company blog)
│   │   ├── BlogDetailFeature.tsx
│   │   ├── BlogListPage.tsx
│   │   ├── CompanyBlogManagement.tsx (HR)
│   │   └── components/
│   │       ├── BlogCard.tsx
│   │       ├── BlogList.tsx
│   │       └── CompanyBlogSection.tsx
│   │
│   ├── profile/               ← Profile user & HR
│   │   ├── components/
│   │   │   ├── PersonalInfoForm.tsx   ← Form thông tin cá nhân (GPS, domain, certificate)
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ExperienceManagement.tsx
│   │   │   ├── EducationManagement.tsx
│   │   │   ├── CVManagement.tsx
│   │   │   ├── FreelanceManagement.tsx
│   │   │   ├── BlogManagementSection.tsx
│   │   │   ├── JobPostingManagementSection.tsx
│   │   │   ├── CompanyInfoForm.tsx (HR)
│   │   │   └── ImageGalleryManagementSection.tsx
│   │   └── api/profileApi.ts
│   │
│   ├── chat/                  ← Chat real-time
│   │   ├── ChatPage.tsx       ← Main chat page (ConversationsList + MessageThread)
│   │   ├── ChatListPage.tsx
│   │   ├── ConversationsPage.tsx
│   │   └── components/
│   │       ├── ConversationsList.tsx    ← Danh sách cuộc trò chuyện
│   │       ├── MessageThread.tsx        ← Luồng tin nhắn
│   │       ├── MessageBubble.tsx        ← Bọt tin nhắn (sent/received)
│   │       ├── MessageInput.tsx         ← Ô nhập tin nhắn
│   │       ├── NotificationBell.tsx     ← Chuông thông báo chat mới
│   │       └── TypingIndicator.tsx      ← Trạng thái đang nhập...
│   │
│   ├── applications/          ← Quản lý đơn ứng tuyển
│   │   ├── MyApplicationsPage.tsx ← Danh sách đơn của ứng viên
│   │   ├── JobApplicationsPage.tsx ← Danh sách ứng viên (HR)
│   │   └── CandidateProfileView.tsx
│   │
│   ├── freelance/             ← Freelance projects
│   │   ├── index.tsx         ← FreelanceFeature
│   │   ├── FreelanceDetailFeature.tsx
│   │   ├── FreelancerProfileView.tsx
│   │   ├── ApplicantsList.tsx
│   │   ├── CreateProjectModal.tsx
│   │   ├── ApplyProjectModal.tsx
│   │   ├── ClientInfoModal.tsx
│   │   ├── DepositPaymentCard.tsx
│   │   ├── ProjectProgressTracker.tsx
│   │   └── components/
│   │       ├── FreelanceCard.tsx
│   │       ├── FreelanceList.tsx
│   │       └── FreelanceSearch.tsx
│   │
│   ├── cv-builder/            ← Tạo CV
│   │   └── index.tsx          ← CVBuilderFeature + CVPreview
│   │
│   └── saved-items/            ← Lưu trữ
│       └── index.tsx
│
├── store/                     ← Zustand state management
│   ├── useAuthStore.ts        ← Auth state (user, token, login/logout/Google/GitHub/Facebook)
│   ├── useJobStore.ts
│   ├── useCompanyStore.ts
│   ├── useBlogStore.ts
│   └── useJobCommentStore.ts
│
├── hooks/                     ← Custom React hooks
│   ├── usePermissions.ts      ← Check permissions theo userType
│   └── useCompanyWithDomain.ts
│
├── lib/                       ← Utilities & API
│   ├── api.ts                 ← Axios instance, interceptors (token, auto-refresh)
│   ├── authApi.ts             ← Google, GitHub, Facebook login
│   ├── jobApi.ts
│   ├── jobDetailApi.ts
│   ├── companyApi.ts
│   ├── blogApi.ts
│   ├── profileApi.ts
│   ├── userApi.ts
│   ├── chatApi.ts             ← Conversations, messages, markAsRead
│   ├── applicationApi.ts      ← Apply, accept, reject, confirm, delete
│   ├── freelanceApi.ts
│   ├── savedJobApi.ts
│   ├── savedCompanyApi.ts
│   ├── companyBlogApi.ts
│   ├── companyReviewApi.ts
│   ├── companyImageApi.ts
│   ├── locationApi.ts         ← Geolocation, updateLocation
│   ├── domainApi.ts           ← Active domains/lĩnh vực
│   ├── industryApi.ts
│   ├── notificationApi.ts     ← Unread count, notifications, markAsRead
│   ├── cvApi.ts
│   ├── cvSecurity.ts
│   ├── uploadApi.ts           ← Upload image
│   ├── permissions.ts         ← Hệ thống phân quyền userType
│   ├── constants.ts
│   └── tokenManager.ts
│
├── styles/
│   ├── globals.css
│   └── profile.css
│
├── theme/
│   └── themeConfig.ts         ← Ant Design theme (Blue #3b82f6)
│
├── eslint.config.mjs
├── tailwind.config.mjs
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
├── package.json
│
└── toantaduan/                ← SKILL documentation
    ├── SKILL.md
    ├── scripts/
    ├── references/
    └── assets/
```

## Công nghệ sử dụng

| Category | Tech |
|----------|------|
| Framework | Next.js 16.1.6 (Pages Router) |
| Language | TypeScript 5.x |
| UI Library | Ant Design 6.x |
| State | Zustand 5.x (với persist middleware) |
| HTTP Client | Axios 1.x |
| Auth | Google OAuth, GitHub OAuth, Facebook OAuth |
| Styling | Tailwind CSS 4, CSS Modules |
| React | 19.2.3 |

## Hệ thống phân quyền (Permissions)

3 loại user với quyền khác nhau:

```typescript
type UserType = 'job_seeker' | 'freelancer' | 'hr';

interface Permission {
  canPostJob: boolean;          // Đăng tin tuyển dụng
  canApplyJob: boolean;         // Ứng tuyển việc
  canCreateCV: boolean;         // Tạo CV
  canPostFreelanceProject: boolean; // Đăng dự án freelance
  canApplyFreelance: boolean;   // Ứng tuyển freelance
}
```

| Quyền | HR | Freelancer | Job Seeker |
|-------|-----|------------|------------|
| canPostJob | ✅ | ❌ | ❌ |
| canApplyJob | ❌ | ✅ | ✅ |
| canCreateCV | ❌ | ✅ | ✅ |
| canPostFreelanceProject | ❌ | ❌ | ❌ |
| canApplyFreelance | ❌ | ✅ | ✅ |

```typescript
// Kiểm tra quyền trong component
const { canPostJob, canApplyJob, userType } = usePermissions();
```

## Authentication

Hỗ trợ 3 phương thức OAuth đăng nhập:

### 1. Google Login
```typescript
// pages/login.tsx hoặc features/auth/LoginFeature.tsx
const { googleLogin } = useAuthStore();
await googleLogin(idToken, userType);
```

### 2. GitHub Login
```typescript
// Lưu userType vào localStorage trước khi redirect
localStorage.setItem('pendingUserType', userType);
window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;

// Callback handler
const { githubLogin } = useAuthStore();
await githubLogin(code, userType);
```

### 3. Facebook Login
```typescript
const { facebookLogin } = useAuthStore();
await facebookLogin(accessToken, userType);
```

### User Interface
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  userType: 'job_seeker' | 'freelancer' | 'hr';
  companyId?: number;
}
```

### Token Management
- Lưu trong localStorage: `token`, `refreshToken`, `user`
- Axios interceptor tự động gắn `Authorization: Bearer {token}`
- Auto-refresh token khi nhận 401

## API Integration

Base URL từ env: `NEXT_PUBLIC_API_URL` hoặc mặc định `http://localhost:8080`

```typescript
// Tất cả API calls qua lib/api.ts
import { api } from '@/lib/api';

// Hoặc qua các API module riêng
import { jobApi } from '@/lib/jobApi';
import { chatApi } from '@/lib/chatApi';
import { notificationApi } from '@/lib/notificationApi';
```

### Các API modules chính

| Module | File | Mô tả |
|--------|------|-------|
| Auth | `lib/authApi.ts` | Google, GitHub, Facebook login |
| Jobs | `lib/jobApi.ts` | CRUD jobs, search, filters |
| Companies | `lib/companyApi.ts` | Company info, reviews |
| Blog | `lib/blogApi.ts` | Platform blog |
| Company Blog | `lib/companyBlogApi.ts` | HR company blog |
| Profile | `lib/profileApi.ts` | User profile management |
| Chat | `lib/chatApi.ts` | Conversations, messages, read status |
| Applications | `lib/applicationApi.ts` | Apply, accept, reject, confirm |
| Freelance | `lib/freelanceApi.ts` | Freelance projects |
| Saved | `lib/savedJobApi.ts`, `lib/savedCompanyApi.ts` | Lưu jobs/companies |
| Location | `lib/locationApi.ts` | Geolocation, updateLocation |
| Domain | `lib/domainApi.ts` | Active domains (lĩnh vực) |
| Notification | `lib/notificationApi.ts` | Unread count, mark as read |
| Upload | `lib/uploadApi.ts` | Upload images |
| CV | `lib/cvApi.ts` | CV management, security |

## Stores (Zustand)

### useAuthStore
```typescript
const { user, isAuthenticated, isLoading, login, logout, initAuth, googleLogin, githubLogin, facebookLogin, updateUser } = useAuthStore();

// Khởi tạo auth từ localStorage (gọi trong _app.tsx)
initAuth();
```

### useJobStore, useCompanyStore, useBlogStore
```typescript
// Job store
const { jobs, loading, fetchJobs, filters, setFilters } = useJobStore();

// Company store
const { companies, loading, fetchCompanies } = useCompanyStore();
```

## Theme

Ant Design theme với màu chủ đạo **Blue (#3b82f6)**:

```typescript
// theme/themeConfig.ts
colorPrimary: '#3b82f6',      // Blue chính
colorSuccess: '#10b981',      // Green
colorWarning: '#f59e0b',     // Yellow
colorError: '#ef4444',       // Red
colorInfo: '#06b6d4',        // Cyan

borderRadius: 8,
controlHeight: 40,
fontSize: 14,

// Gradient màu dùng trong UI
from-blue-600 via-cyan-600 to-teal-600
```

## Tính năng chính

### Ứng viên (job_seeker) & Freelancer
- **Tìm kiếm việc**: Job list, search, filters (location, type, salary)
- **Ứng tuyển**: ApplyModal với CV upload, cover letter
- **Quản lý CV**: CVBuilder, upload certificates
- **Theo dõi đơn**: Trạng thái (pending → reviewing → accepted/rejected)
- **Tiến độ phỏng vấn**: Round tracking, xác nhận đi làm
- **Lưu trữ**: Lưu jobs, companies
- **Chat real-time**: Nhắn tin với HR, reply tin nhắn, gửi hình ảnh
- **Thông báo chat**: Badge số tin nhắn chưa đọc, notification popup, mark as read
- **Notifications**: Thông báo chấp nhận/từ chối, thông báo chat mới
- **Geolocation**: Lấy vị trí GPS tự động
- **Profile**: PersonalInfoForm với domain, certificate images

### Nhà tuyển dụng (HR)
- **Đăng tin**: PostJobPage với salary, requirements, interview rounds
- **Quản lý tin**: My jobs, edit, delete
- **Xem ứng viên**: JobApplicationsPage, CandidateProfileView
- **Review CV**: HRCVViewer, HRCVAccessButton
- **Chat real-time**: Nhắn tin với ứng viên, reply tin nhắn, gửi hình ảnh
- **Thông báo chat**: Badge số tin nhắn chưa đọc, notification popup, mark as read
- **Blog công ty**: CompanyBlogManagement, create/edit blogs
- **Hình ảnh công ty**: ImageGalleryManagementSection
- **Reviews**: CompanyReviewSection

### Freelancer
- **Tìm dự án**: FreelanceList, FreelanceSearch
- **Ứng tuyển**: ApplyProjectModal
- **Xem tiến độ**: ProjectProgressTracker
- **Deposit**: DepositPaymentCard

## Navbar & Layout

### Navbar (components/layout/Navbar.tsx)
- Logo "ViệcLàm24h" (gradient V)
- Desktop nav: Home, Jobs, Freelance, Companies, Thư mục lưu, Blog, Tin nhắn
- **Chat icon** với badge số tin nhắn chưa đọc
- Notifications dropdown (Badge count, mark as read)
- User menu (Profile, Settings, Tạo CV, Logout)
- Mobile menu (hamburger)
- Poll notifications mỗi 2 phút

### MainLayout
```typescript
<MainLayout>
  <PageContent />
</MainLayout>
```

## PersonalInfoForm (features/profile/components/PersonalInfoForm.tsx)

Form phức tạp với:
- Thông tin cá nhân (name, email, phone, bio)
- Vị trí công việc hiện tại
- Lĩnh vực quan tâm (Domain Select - searchable)
- GPS location (navigator.geolocation)
- Quê quán, vị trí hiện tại
- Certificate upload (bắt buộc cho Freelance)

## Chat System (features/chat/ChatPage.tsx)

Hệ thống chat real-time với thông báo đến, hỗ trợ đa nền tảng (ứng viên, freelancer, HR).

### Cấu trúc trang chat
```
features/chat/
├── ChatPage.tsx           ← Trang chat chính (ConversationsList + MessageThread)
├── ChatListPage.tsx       ← Trang danh sách cuộc trò chuyện
├── ConversationsPage.tsx  ← Trang quản lý cuộc trò chuyện
└── components/
    ├── ConversationsList.tsx    ← Danh sách cuộc trò chuyện (sidebar)
    ├── MessageThread.tsx        ← Luồng tin nhắn (nội dung chat)
    ├── MessageBubble.tsx        ← Bọt tin nhắn (sender/receiver)
    ├── MessageInput.tsx         ← Ô nhập tin nhắn
    ├── NotificationBell.tsx     ← Chuông thông báo chat mới
    └── TypingIndicator.tsx      ← Trạng thái "đang nhập..."
```

### Tính năng chính

#### 1. Danh sách cuộc trò chuyện (ConversationsList)
- Hiển thị danh sách cuộc trò chuyện với thông tin:
  - Avatar + tên người dùng đối phương
  - Tin nhắn preview (cuối cùng)
  - Timestamp (thời gian gửi)
  - **Badge thông báo** (số tin nhắn chưa đọc)
  - Indicator người dùng online/offline
- Tìm kiếm cuộc trò chuyện theo tên
- Lọc theo: tất cả, chưa đọc, đã ghim
- Click vào cuộc trò chuyện → mở MessageThread

#### 2. Luồng tin nhắn (MessageThread)
- Hiển thị lịch sử tin nhắn với:
  - Tin nhắn đã gửi (căn phải, màu gradient)
  - Tin nhắn đã nhận (căn trái, nền xám)
  - Timestamp mỗi tin nhắn
  - Trạng thái đã đọc / đã gửi / đang gửi
- **Reply tin nhắn** (nhấn vào tin nhắn → reply)
- **Chia sẻ hình ảnh** (upload qua uploadApi)
- Auto-scroll xuống tin nhắn mới nhất
- Load tin nhắn cũ khi cuộn lên (infinite scroll / load more)

#### 3. Thông báo chat mới (NotificationBell)
- Icon chuông trên Navbar
- Badge số thông báo chat chưa đọc
- Dropdown hiển thị danh sách thông báo:
  - Avatar người gửi
  - Nội dung tin nhắn preview
  - Thời gian
  - Đánh dấu đã đọc / chưa đọc
- Click thông báo → nhảy đến cuộc trò chuyện tương ứng
- Mark all as read

#### 4. Real-time & Polling
- **Polling tin nhắn**: mỗi **3 giây** kiểm tra tin nhắn mới
- **Polling thông báo**: mỗi **2 phút** kiểm tra thông báo mới
- Khi có tin nhắn mới:
  - Badge count tăng trên icon chat
  - Toast/notification popup (nếu đang ở trang khác)
  - Cuộc trò chuyện được đẩy lên đầu danh sách
- Typing indicator khi người đối phương đang nhập

### API Endpoints (lib/chatApi.ts)

```typescript
// Lấy danh sách cuộc trò chuyện
GET /api/conversations
Response: Conversation[]

// Lấy tin nhắn trong cuộc trò chuyện
GET /api/conversations/{conversationId}/messages
Query: ?page=1&limit=50
Response: Message[]

// Gửi tin nhắn
POST /api/conversations/{conversationId}/messages
Body: { content: string, imageUrl?: string, replyToId?: number }
Response: Message

// Tạo cuộc trò chuyện mới (bắt đầu chat với user khác)
POST /api/conversations
Body: { participantId: number }
Response: Conversation

// Đánh dấu đã đọc
PUT /api/conversations/{conversationId}/read

// Xóa cuộc trò chuyện
DELETE /api/conversations/{conversationId}

// Lấy số thông báo chat chưa đọc
GET /api/notifications/unread-count
Response: { unreadCount: number }

// Đánh dấu thông báo đã đọc
PUT /api/notifications/{notificationId}/read
```

### Data Models

```typescript
interface Conversation {
  id: number;
  participants: User[];         // 2 người tham gia
  lastMessage?: Message;        // Tin nhắn cuối cùng
  unreadCount: number;         // Số tin nhắn chưa đọc (của user hiện tại)
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  imageUrl?: string;
  replyToId?: number;
  replyTo?: Message;           // Tin nhắn được reply
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: string;
}

interface ChatNotification {
  id: number;
  type: 'message' | 'application' | 'system';
  title: string;
  body: string;
  conversationId?: number;
  isRead: boolean;
  createdAt: string;
}
```

### Components Usage

```typescript
// Trang chat chính (pages/chat/index.tsx)
import { ChatPage } from '@/features/chat/ChatPage';

<ChatPage />

// Sidebar danh sách cuộc trò chuyện (dùng trong MainLayout)
import { ConversationsList } from '@/features/chat/components/ConversationsList';

<ConversationsList
  onSelectConversation={(conv) => setActiveConversation(conv)}
  activeConversationId={activeId}
/>

// Luồng tin nhắn
import { MessageThread } from '@/features/chat/components/MessageThread';

<MessageThread
  conversationId={conversationId}
  messages={messages}
  onSendMessage={sendMessage}
  onReply={setReplyTo}
  onLoadMore={loadMoreMessages}
/>

// Notification bell (dùng trong Navbar)
import { NotificationBell } from '@/features/chat/components/NotificationBell';

<NotificationBell onNotificationClick={navigateToConversation} />
```

### Polling Integration

```typescript
// Trong ChatPage hoặc MessageThread
useEffect(() => {
  const interval = setInterval(async () => {
    // Kiểm tra tin nhắn mới
    await fetchNewMessages(conversationId);
    // Cập nhật số thông báo chưa đọc
    await fetchUnreadCount();
  }, 3000); // 3 giây

  return () => clearInterval(interval);
}, [conversationId]);
```

### UI/UX Guidelines

| Element | Style |
|---------|-------|
| Conversation item | Card với hover effect, border-left màu primary khi active |
| Message bubble (sent) | Gradient blue, căn phải, rounded corners |
| Message bubble (received) | Nền #f0f0f0, căn trái, rounded corners |
| Unread badge | Ant Design Badge, màu đỏ, góc phải trên avatar |
| Timestamp | Font nhỏ 12px, màu xám, dưới message |
| Notification popup | Ant Design Toast / message, position top-right |
| Loading | Skeleton (Ant Design) cho danh sách cuộc trò chuyện |
| Empty state | Icon chat + text "Chưa có cuộc trò chuyện nào" |

### Phân biệt HR vs Job Seeker/Freelancer

- Cuộc trò chuyện giữa **HR** và **ứng viên/freelancer** liên quan đến job/application
- HR có quyền xem thông tin ứng viên trong chat header
- Freelancer hiển thị badge "Freelancer" trên avatar
- HR có thể bắt đầu chat từ trang CandidateProfileView
- Ứng viên/freelancer có thể bắt đầu chat từ trang JobDetail hoặc CompanyDetail

## Applications Tracking (features/applications/MyApplicationsPage.tsx)

- Table với job info, interview progress, status
- Round progress (Progress bar)
- Xác nhận đi làm (confirmApplication)
- Alert khi có đơn được chấp nhận
- Status: pending → reviewing → accepted/rejected

## Scripts

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Build production
npm run start    # Production server
npm run lint     # ESLint
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
NEXT_PUBLIC_GITHUB_CLIENT_ID=xxx
NEXT_PUBLIC_FACEBOOK_APP_ID=xxx
```

## Chú ý quan trọng

1. **Pages Router** - Dùng `pages/` directory, KHÔNG phải App Router
2. **Ant Design ConfigProvider** - Đã wrap trong `_app.tsx`
3. **Auth init** - Gọi `initAuth()` trong `_app.tsx` useEffect
4. **Permissions** - Luôn dùng `usePermissions()` hook để check quyền trước khi hiển thị/hide features
5. **API calls** - Tất cả qua `lib/api.ts` để có interceptors tự động
6. **Stores** - Dùng Zustand với `persist` middleware cho auth
7. **Chat polling** - Poll messages mỗi 3 giây, notifications mỗi 2 phút, unread count badge trên icon chat
8. **Chat notifications** - Badge số tin nhắn chưa đọc trên icon chat, notification popup khi có tin nhắn mới, mark as read khi mở cuộc trò chuyện
9. **Notifications** - Silent fail (không hiện error message cho rate limit 429)
10. **Geolocation** - Dùng `navigator.geolocation.getCurrentPosition` trong PersonalInfoForm
11. **User Type Selection** - Modal hiện SAU khi OAuth callback nhận credential

## Liên hệ / Hỗ trợ

Báo lỗi hoặc đề xuất tính năng qua issue trên repository.
