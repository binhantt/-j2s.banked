# Stores Reference

Tài liệu tham khảo Zustand stores trong dự án Hove Giao Dien Users.

## Cấu trúc

```
store/
├── useAuthStore.ts           ← Auth state (user, token, login/logout)
├── useJobStore.ts           ← Job list & filters
├── useCompanyStore.ts       ← Company list
├── useBlogStore.ts          ← Blog search & filter
└── useJobCommentStore.ts    ← Job comments
```

## useAuthStore

Store quản lý authentication state.

### State

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
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

### Actions

```typescript
// Khởi tạo auth từ localStorage
initAuth(): void

// Đăng nhập với thông tin user
login(user: User, token: string, refreshToken?: string): void

// Đăng xuất
logout(): void

// Cập nhật thông tin user
updateUser(user: User): void

// Cập nhật avatar
updateUserAvatar(avatarUrl: string | null): void

// Đăng nhập Google
googleLogin(idToken: string, userType?: UserType): Promise<void>

// Đăng nhập GitHub
githubLogin(code: string, userType?: UserType): Promise<void>

// Đăng nhập Facebook
facebookLogin(accessToken: string, userType?: UserType): Promise<void>
```

### Cách sử dụng

```tsx
import { useAuthStore } from '@/store/useAuthStore';

// Trong component
function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  // Hoặc lấy action riêng
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
}

// Gọi outside component (VD: trong API call)
const { user } = useAuthStore.getState();
```

### Ví dụ: Protected Component

```tsx
import { useAuthStore } from '@/store/useAuthStore';

function ProtectedComponent({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? children : null;
}
```

### Ví dụ: User Menu

```tsx
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

function UserMenu() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ của tôi',
      onClick: () => router.push('/profile')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: logout
    }
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Avatar
        src={user?.avatarUrl}
        icon={!user?.avatarUrl && <UserOutlined />}
        className="cursor-pointer"
      />
    </Dropdown>
  );
}
```

### Khởi tạo trong _app.tsx

```tsx
// pages/_app.tsx
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

function App({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ConfigProvider theme={theme}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
```

---

## useJobStore

Store quản lý danh sách việc làm và filters.

### State

```typescript
interface JobStore {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### JobFilters Interface

```typescript
interface JobFilters {
  search?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  domainId?: number;
}
```

### Job Interface

```typescript
interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  jobType: string;
  deadline: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  interviewRounds: number;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}
```

### Actions

```typescript
// Lấy danh sách jobs
fetchJobs(filters?: JobFilters): Promise<void>

// Lấy job chi tiết
fetchJobDetail(jobId: number): Promise<Job>

// Cập nhật filters
setFilters(filters: Partial<JobFilters>): void

// Reset filters
resetFilters(): void

// Thêm job mới
addJob(job: Job): void

// Cập nhật job
updateJob(job: Job): void

// Xóa job
removeJob(jobId: number): void

// Chuyển trang
setPage(page: number): void
```

### Cách sử dụng

```tsx
import { useJobStore } from '@/store/useJobStore';

// Trong component
function JobListPage() {
  const { jobs, loading, filters, fetchJobs, setFilters, resetFilters } = useJobStore();

  useEffect(() => {
    fetchJobs(filters);
  }, [filters]);

  return (
    <div>
      <JobSearchBar
        value={filters.search}
        onChange={(search) => setFilters({ search })}
      />

      <JobFilters
        filters={filters}
        onChange={setFilters}
      />

      {loading ? (
        <Spin />
      ) : (
        <JobList jobs={jobs} />
      )}

      <Pagination
        current={pagination.page}
        total={pagination.total}
        onChange={(page) => setPage(page)}
      />
    </div>
  );
}
```

### Ví dụ: Filter Change

```tsx
import { useJobStore } from '@/store/useJobStore';

function FilterSection() {
  const { filters, setFilters, resetFilters } = useJobStore();

  const handleLocationChange = (location: string) => {
    setFilters({ ...filters, location });
  };

  const handleTypeChange = (jobType: string) => {
    setFilters({ ...filters, jobType });
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="flex gap-4">
      <Select
        placeholder="Địa điểm"
        value={filters.location}
        onChange={handleLocationChange}
        options={locations}
      />

      <Select
        placeholder="Loại công việc"
        value={filters.jobType}
        onChange={handleTypeChange}
        options={jobTypes}
      />

      <Button onClick={handleReset}>Reset</Button>
    </div>
  );
}
```

---

## useCompanyStore

Store quản lý danh sách công ty.

### State

```typescript
interface CompanyStore {
  companies: Company[];
  loading: boolean;
  error: string | null;
  search: string;
  industry?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Company Interface

```typescript
interface Company {
  id: number;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  website?: string;
  industry: string;
  companySize: string;
  address: string;
  foundedYear?: number;
  coverImageCount: number;
  reviewCount: number;
  rating?: number;
}
```

### Actions

```typescript
// Lấy danh sách công ty
fetchCompanies(params?: FetchParams): Promise<void>

// Tìm kiếm công ty
searchCompanies(query: string): Promise<void>

// Lấy chi tiết công ty
fetchCompanyDetail(companyId: number): Promise<Company>

// Cập nhật search
setSearch(search: string): void

// Reset state
reset(): void
```

### Cách sử dụng

```tsx
import { useCompanyStore } from '@/store/useCompanyStore';

function CompanyListPage() {
  const { companies, loading, search, fetchCompanies, setSearch } = useCompanyStore();

  useEffect(() => {
    fetchCompanies({ search });
  }, [search]);

  return (
    <div>
      <Input.Search
        placeholder="Tìm kiếm công ty..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={setSearch}
      />

      <CompanyList companies={companies} loading={loading} />
    </div>
  );
}
```

---

## useBlogStore

Store quản lý blog search và filter.

### State

```typescript
interface BlogStore {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Actions

```typescript
// Lấy danh sách blog
fetchBlogs(params?: FetchParams): Promise<void>

// Tìm kiếm blog
setSearchQuery(query: string): void

// Lọc theo category
setSelectedCategory(category: string): void

// Reset
reset(): void
```

### Cách sử dụng

```tsx
import { useBlogStore } from '@/store/useBlogStore';

function BlogPage() {
  const {
    blogs,
    loading,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory
  } = useBlogStore();

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Kỹ năng', label: 'Kỹ năng' },
    { value: 'Nghề nghiệp', label: 'Nghề nghiệp' },
    { value: 'Công nghệ', label: 'Công nghệ' },
  ];

  return (
    <div>
      <Input
        placeholder="Tìm kiếm bài viết..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Select
        value={selectedCategory}
        onChange={setSelectedCategory}
        options={categories}
      />

      <BlogList blogs={blogs} loading={loading} />
    </div>
  );
}
```

---

## useJobCommentStore

Store quản lý comments của job.

### State

```typescript
interface JobCommentStore {
  comments: JobComment[];
  loading: boolean;
  error: string | null;
}
```

### JobComment Interface

```typescript
interface JobComment {
  id: number;
  jobId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}
```

### Actions

```typescript
// Lấy comments của job
fetchComments(jobId: number): Promise<void>

// Thêm comment
addComment(jobId: number, content: string): Promise<void>

// Xóa comment
deleteComment(commentId: number): Promise<void>
```

### Cách sử dụng

```tsx
import { useJobCommentStore } from '@/store/useJobCommentStore';

function JobComments({ jobId }) {
  const { comments, loading, fetchComments, addComment } = useJobCommentStore();
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments(jobId);
  }, [jobId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await addComment(jobId, newComment);
    setNewComment('');
  };

  return (
    <div>
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          author={comment.userName}
          avatar={comment.userAvatar}
          content={comment.content}
          datetime={comment.createdAt}
        />
      ))}

      <TextArea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Viết bình luận..."
      />

      <Button onClick={handleSubmit}>Gửi</Button>
    </div>
  );
}
```

---

## Tạo Store mới

### Template

```typescript
// store/useNewStore.ts
import { create } from 'zustand';

interface NewStore {
  // State
  items: Item[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => Promise<void>;
  updateItem: (item: Item) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  reset: () => void;
}

export const useNewStore = create<NewStore>((set, get) => ({
  // Initial state
  items: [],
  loading: false,
  error: null,

  // Actions
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await newApi.getItems();
      set({ items: data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch', loading: false });
    }
  },

  addItem: async (item: Item) => {
    try {
      await newApi.createItem(item);
      set((state) => ({ items: [...state.items, item] }));
    } catch (error) {
      set({ error: 'Failed to add' });
      throw error;
    }
  },

  updateItem: async (item: Item) => {
    try {
      await newApi.updateItem(item.id, item);
      set((state) => ({
        items: state.items.map((i) => (i.id === item.id ? item : i)),
      }));
    } catch (error) {
      set({ error: 'Failed to update' });
      throw error;
    }
  },

  deleteItem: async (id: number) => {
    try {
      await newApi.deleteItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete' });
      throw error;
    }
  },

  reset: () => {
    set({ items: [], loading: false, error: null });
  },
}));
```

### Với Persist Middleware (Auth Store)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  // ...
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      // ...
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Chỉ lưu những field cần thiết
      }),
    }
  )
);
```

---

## Best Practices

### 1. Selector tối ưu

```tsx
// ❌ Bad - re-render khi bất kỳ state nào thay đổi
const { user, jobs, loading } = useJobStore();

// ✅ Good - chỉ re-render khi jobs hoặc loading thay đổi
const jobs = useJobStore((state) => state.jobs);
const loading = useJobStore((state) => state.loading);

// ✅ Best - combine selector
const { jobs, loading } = useJobStore((state) => ({
  jobs: state.jobs,
  loading: state.loading,
}));
```

### 2. Gọi getState() outside component

```tsx
// ✅ Correct - dùng getState()
const { user } = useAuthStore.getState();

// ❌ Wrong - KHÔNG gọi hook outside component
const { user } = useAuthStore(); // Error!
```

### 3. Reset state khi logout

```tsx
// Trong logout action của useAuthStore
logout: () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Reset other stores
  useJobStore.getState().reset();
  useCompanyStore.getState().reset();
  useBlogStore.getState().reset();

  set({ user: null, isAuthenticated: false });
}
```

### 4. Error handling

```tsx
// Luôn handle error trong actions
fetchJobs: async (filters) => {
  set({ loading: true, error: null });
  try {
    const data = await jobApi.getJobs(filters);
    set({ jobs: data, loading: false });
  } catch (error: any) {
    set({
      error: error.response?.data?.message || 'Failed to fetch jobs',
      loading: false
    });
    message.error('Không thể tải danh sách việc làm');
  }
}
```
