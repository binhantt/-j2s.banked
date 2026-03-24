# Kiến trúc hệ thống — ViệcLàm24h

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                    │
│                  (Port 3000)                         │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│  pages/  │ features/│ components│  store/  │  lib/   │
│ (Routes)│  (Pages)  │(Reusable) │ (Zustand)│  (API) │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬────┘
     │          │          │          │          │
     └──────────┴──────────┴──────────┴──────────┴───► api (axios)
                                                          │
                                                          ▼
                                               ┌──────────────────┐
                                               │  Backend API     │
                                               │  :8080           │
                                               │  /api/*          │
                                               └──────────────────┘
```

## Thư mục source chính

```
hove_giao_dien_users/
├── pages/                    ← Next.js file-based routing
│   ├── login.tsx             → /login
│   ├── index.tsx             → /
│   └── _app.tsx              ← App wrapper
├── features/                  ← Feature-based pages (khuyến khích)
│   ├── jobs/
│   │   ├── JobsListPage.tsx     → /jobs
│   │   ├── JobDetailFeature.tsx → /jobs/[id]
│   │   ├── PostJobPage.tsx       → /post-job
│   │   └── SavedJobsPage.tsx     → /saved-jobs
│   ├── blog/
│   │   ├── BlogListPage.tsx       → /blog
│   │   └── BlogDetailFeature.tsx   → /blog/[id]
│   ├── chat/
│   │   └── ChatPage.tsx           → /chat /chat/[id]
│   ├── profile/
│   │   └── index.tsx              → /profile
│   ├── companies/
│   │   └── CompanyDetailFeature.tsx → /company/[id]
│   ├── freelance/
│   │   ├── index.tsx               → /freelance
│   │   ├── FreelanceDetailFeature.tsx → /freelance/[id]
│   │   ├── CreateProjectModal.tsx
│   │   ├── ApplicantsList.tsx
│   │   └── ApplyProjectModal.tsx
│   └── applications/
│       ├── MyApplicationsPage.tsx   → /my-applications
│       ├── JobApplicationsPage.tsx   → /applications/[jobId]
│       └── CandidateProfileView.tsx
├── components/                ← Shared UI components
│   ├── SaveJobButton.tsx      ← Reusable save button
│   ├── SaveCompanyButton.tsx  ← Reusable company save
│   ├── MainLayout.tsx         ← Layout wrapper
│   ├── JobCard.tsx            ← Job card component
│   ├── JobSearchBar.tsx       ← Search bar
│   └── JobFilters.tsx         ← Filter sidebar
├── store/                     ← Zustand stores
│   ├── useAuthStore.ts        ← Auth state
│   └── useJobStore.ts         ← Job list state
├── lib/                       ← API clients
│   ├── api.ts                 ← Axios instance + interceptors
│   ├── authApi.ts             ← Auth endpoints
│   ├── jobApi.ts              ← Job endpoints
│   ├── applicationApi.ts      ← Application endpoints
│   ├── chatApi.ts             ← Chat endpoints
│   ├── blogApi.ts             ← Blog endpoints
│   ├── profileApi.ts          ← Profile endpoints
│   ├── freelanceApi.ts        ← Freelance endpoints
│   ├── companyApi.ts          ← Company endpoints
│   ├── savedJobApi.ts         ← Save job endpoints
│   └── savedCompanyApi.ts     ← Save company endpoints
├── hooks/                     ← Custom React hooks
│   └── usePermissions.ts     ← Permission checks
└── theme/                     ← Antd theme config
```

## API Layer Architecture

### Axios Instance (lib/api.ts)

```typescript
// 1. Tạo instance với base URL
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  maxRedirects: 5,
});

// 2. Request interceptor — thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response interceptor — xử lý 401 + auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Thử refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
      localStorage.setItem('token', response.data.token);
      // Retry request với token mới
      return api(originalRequest);
    }
    // Nếu refresh thất bại → logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Modules (lib/*.ts)

```typescript
// Pattern chung cho tất cả API modules
export const someApi = {
  getList: async (params?: any) => {
    const response = await api.get('/api/resource', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/resource/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/resource', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/api/resource/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/resource/${id}`);
  },
};
```

## State Management (Zustand)

### Auth Store (useAuthStore)

```typescript
// store/useAuthStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  googleLogin: (idToken: string, userType?: UserType) => Promise<void>;
  githubLogin: (code: string, userType?: UserType) => Promise<void>;
  initAuth: () => void;
}

// Persisted to localStorage via zustand/middleware
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      },

      googleLogin: async (idToken, userType) => {
        const response = await authApi.googleLogin(idToken, userType);
        get().login(response.user, response.token, response.refreshToken);
      },

      githubLogin: async (code, userType) => {
        const response = await authApi.githubLogin(code, userType);
        get().login(response.user, response.token, response.refreshToken);
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
);
```

### Job Store (useJobStore)

```typescript
// store/useJobStore.ts
interface Job {
  id: number;
  title: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  jobType: string;
  level: string;
  experience: string;
  description: string;
  requirements: string;
  benefits: string;
  deadline: string;
  status: string;
  applications: number;
  views: number;
  companyName?: string;
  companyId?: number;
  companyLogoUrl?: string;
}

interface JobStore {
  jobs: Job[];
  filters: any;
  fetchJobs: () => Promise<void>;
  setFilters: (filters: any) => void;
}
```

## User Types & Permissions

```typescript
type UserType = 'job_seeker' | 'freelancer' | 'hr';

// Permission hooks (hooks/usePermissions.ts)
canApplyJob()        // job_seeker, freelancer
canPostJob()         // hr only
canManageApplications() // hr only
canApplyFreelance()  // freelancer only
canCreateProject()   // freelancer only (client mode)
canChat()             // all authenticated users
```

## OAuth Flow

### Google Login
```
1. Load Google Identity Services script (https://accounts.google.com/gsi/client)
2. Initialize with client_id
3. User clicks → One Tap / button rendered
4. Google returns credential (JWT idToken)
5. Send idToken to backend: POST /api/auth/google { idToken, userType }
6. Backend returns { userId, name, email, avatarUrl, userType, token, refreshToken }
7. Store tokens in localStorage
8. Redirect to /
```

### GitHub Login
```
1. User clicks GitHub button
2. Save userType to localStorage (for callback)
3. Redirect to GitHub OAuth: https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=read:user
4. GitHub redirects to /login?code=xxx
5. In useEffect, detect code from router.query
6. Send code to backend: POST /api/auth/github { code, userType }
7. Backend returns tokens
8. Store tokens + redirect to /
```

## Authentication State Flow

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  _app.tsx   │       │ useAuthStore│       │  pages/      │
│ initAuth()  │──────►│ initAuth()  │       │              │
│             │       │             │       │              │
│ Check token │       │ Parse user  │       │ isAuthenticated
│ in storage  │       │ from local  │       │ ? render :   │
│             │       │             │       │ redirect     │
└─────────────┘       └─────────────┘       └──────────────┘
```

## API Endpoints Map

| Module | Endpoint | Method | Mô tả |
|--------|----------|--------|-------|
| Auth | `/api/auth/google` | POST | Google login |
| Auth | `/api/auth/github` | POST | GitHub login |
| Auth | `/api/auth/refresh` | POST | Refresh token |
| Jobs | `/api/jobs` | GET | List all jobs |
| Jobs | `/api/jobs/active` | GET | List active jobs |
| Jobs | `/api/jobs/{id}` | GET | Job detail |
| Jobs | `/api/jobs` | POST | Create job (HR) |
| Jobs | `/api/jobs/{id}` | PUT | Update job |
| Jobs | `/api/jobs/{id}/toggle-status` | PUT | Toggle status |
| Jobs | `/api/jobs/{id}/view` | PUT | Increment views |
| Applications | `/api/applications` | POST | Apply for job |
| Applications | `/api/applications/job/{id}` | GET | Job applications (HR) |
| Applications | `/api/applications/user/{id}` | GET | User applications |
| Applications | `/api/applications/check/{jobId}/{userId}` | GET | Check if applied |
| Applications | `/api/applications/{id}/status` | PUT | Update status (HR) |
| Applications | `/api/applications/{id}/round` | PUT | Update interview round |
| Applications | `/api/applications/{id}/confirm` | PUT | User confirm going to work |
| Chat | `/api/chat/conversations/job-seeker/{id}` | GET | Job seeker conversations |
| Chat | `/api/chat/conversations/hr/{id}` | GET | HR conversations |
| Chat | `/api/chat/conversations` | POST | Create conversation |
| Chat | `/api/chat/messages/{id}` | GET | Get messages |
| Chat | `/api/chat/messages` | POST | Send message |
| Chat | `/api/chat/messages/read/{convId}/{userId}` | PUT | Mark as read |
| Blog | `/api/blog/posts` | GET | List all posts |
| Blog | `/api/blog/posts/{id}` | GET | Post detail |
| Freelance | `/api/freelance/projects` | GET/POST | List/Create projects |
| Freelance | `/api/freelance/projects/{id}` | GET/PUT/DELETE | Project CRUD |
| Freelance | `/api/freelance/applications` | POST | Apply to project |
| Freelance | `/api/freelance/applications/project/{id}` | GET | Project applications |
| Freelance | `/api/freelance/applications/check` | GET | Check if applied |
| Company | `/api/companies` | GET | List companies |
| Company | `/api/companies/{id}` | GET | Company detail |
| Saved Jobs | `/api/saved-jobs` | POST | Save job |
| Saved Jobs | `/api/saved-jobs/user/{id}` | GET | User saved jobs |
| Saved Jobs | `/api/saved-jobs/check/{userId}/{jobId}` | GET | Check if saved |
| Saved Jobs | `/api/saved-jobs/{userId}/{jobId}` | DELETE | Unsave job |
| Saved Companies | `/api/saved-companies` | POST | Save company |
| Saved Companies | `/api/saved-companies/user/{id}` | GET | User saved companies |
| Saved Companies | `/api/saved-companies/check/{userId}/{companyId}` | GET | Check if saved |
| Profile | `/api/profile/job-seeker/{id}` | GET/PUT | Job seeker profile |
| Profile | `/api/profile/hr/{id}` | GET/PUT | HR profile |
| Profile | `/api/profile/skills/{id}` | GET/POST | Skills |
| Profile | `/api/profile/experience/{id}` | GET/POST | Experience |
| Profile | `/api/profile/education/{id}` | GET/POST | Education |
| Profile | `/api/profile/cv/{id}` | GET/POST/PUT | CV management |

## Key Design Patterns

### 1. Feature-based folder structure (recommended)
```
features/
  jobs/
    JobsListPage.tsx      ← Page component
    JobDetailFeature.tsx  ← Feature component
    components/           ← Feature-specific components
      JobCard.tsx
      JobFilters.tsx
    store/                ← Feature-specific stores
      useJobDetailStore.ts
```

### 2. API Enrichment Pattern (chat)
```typescript
// chatApi.ts — tự động enrich conversation data
const enrichConversation = async (conversation: any) => {
  const [companyResult, jobSeekerResult] = await Promise.allSettled([
    companyApi.getCompanyBasicInfoByHrId(conversation.hrId),
    userApi.getUser(conversation.jobSeekerId),
  ]);
  // Merge enriched data...
  return enriched;
};
```

### 3. Two-step Apply Pattern (jobs)
```typescript
// JobDetailFeature.tsx
// Bước 1: Mở form → nhập CV URL + cover letter
// Bước 2: Preview modal → xác nhận → gửi
const handleApplySubmit = () => {
  // Mở preview modal
};
const handleConfirmApply = async () => {
  await applicationApi.applyJob({ jobPostingId, userId, cvUrl, coverLetter });
  setHasApplied(true);
};
```

### 4. Save/Unsave Toggle Pattern
```typescript
// SaveJobButton.tsx
// 1. Check saved status on mount
// 2. Toggle: if saved → unsave → API DELETE; else → save → API POST
// 3. Update local state → show message
```

## Routing

Next.js file-based routing + dynamic routes:
```
pages/
├── login.tsx                    → /login
├── index.tsx                    → /
├── blog/
│   ├── index.tsx               → /blog
│   └── [id].tsx               → /blog/:id
├── jobs/
│   ├── index.tsx              → /jobs
│   └── [id].tsx               → /jobs/:id
├── post-job.tsx                → /post-job
├── chat.tsx                    → /chat
├── chat.tsx                    → /chat (with id query)
├── profile.tsx                 → /profile
├── company/
│   └── [id].tsx               → /company/:id
├── freelance/
│   ├── index.tsx              → /freelance
│   └── [id].tsx              → /freelance/:id
├── my-applications.tsx        → /my-applications
└── applications/
    └── [jobId].tsx            → /applications/:jobId
```

## Security Notes

1. **Token Storage**: Tokens stored in `localStorage` (no HTTP-only cookie in this SPA)
2. **Auto-refresh**: 401 → attempt refresh → retry → logout on failure
3. **OAuth State**: `pendingUserType` saved to localStorage before GitHub redirect
4. **Role Checks**: Always verify `user.userType` before rendering HR features
5. **API Protection**: All API calls except auth endpoints require `Authorization` header

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google_client_id>
NEXT_PUBLIC_GITHUB_CLIENT_ID=<github_client_id>
```
