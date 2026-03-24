# Style Guide

Hướng dẫn style code cho dự án Hove Giao Dien Users.

## Mục lục

- [TypeScript](#typescript)
- [Components](#components)
- [Naming Conventions](#naming-conventions)
- [State Management](#state-management)
- [API Calls](#api-calls)
- [Styling](#styling)
- [File Structure](#file-structure)
- [Best Practices](#best-practices)

---

## TypeScript

### Basic Types

```typescript
// ✅ Good - sử dụng interfaces cho objects
interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  userType: 'job_seeker' | 'freelancer' | 'hr';
}

// ✅ Good - sử dụng type cho unions/aliases
type UserType = 'job_seeker' | 'freelancer' | 'hr';
type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// ✅ Good - optional properties với ?
interface Props {
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

// ❌ Bad - any type
const data: any = fetchData();

// ✅ Good - unknown với type guard
function processData(data: unknown) {
  if (isUser(data)) {
    console.log(data.name);
  }
}
```

### Generic Types

```typescript
// ✅ Good - generic interface
interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
}

// ✅ Good - generic function
function getItemById<T extends { id: number }>(
  items: T[],
  id: number
): T | undefined {
  return items.find((item) => item.id === id);
}
```

### Import/Export

```typescript
// ✅ Good - named exports
export interface User { ... }
export function useAuth() { ... }
export const API_URL = '...';

// ✅ Good - default export cho main component
export default function MyComponent() { ... }

// ✅ Good - barrel exports (index.ts)
export { Button } from './Button';
export { Input } from './Input';
export type { User } from './types';

// ❌ Bad - import type cho type-only imports
import { User, UserType } from './types'; // nếu chỉ dùng type thì nên import type
import type { User, UserType } from './types'; // ✅
```

---

## Components

### Component Naming

```typescript
// ✅ Good - PascalCase cho component names
const UserProfile = () => { ... };
const JobCard = ({ job }: JobCardProps) => { ... };

// ✅ Good - Page components có suffix Page
const LoginPage = () => { ... };
const ProfilePage = () => { ... };
const JobDetailPage = () => { ... };

// ✅ Good - Feature components có suffix Feature
const HomeFeature = () => { ... };
const LoginFeature = () => { ... };
const JobsFeature = () => { ... };

// ✅ Good - Component files có extension .tsx
// UserProfile.tsx
// JobCard.tsx
// PersonalInfoForm.tsx
```

### Component Structure

```typescript
// ✅ Good - Component structure
import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { userApi } from '@/lib/userApi';

// Types
interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

// Component
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onSave,
}) => {
  // Hooks - luôn ở đầu
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Effects
  useEffect(() => {
    // effect logic
  }, []);

  // Handlers
  const handleSubmit = async () => {
    // handler logic
  };

  // Render
  return (
    <Card>
      <h2>{title}</h2>
      <Button onClick={handleSubmit} loading={loading}>
        Submit
      </Button>
    </Card>
  );
};
```

### Props Handling

```typescript
// ✅ Good - Destructure props
const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  return (
    <Card>
      <h3>{user.name}</h3>
      <Button onClick={() => onEdit(user.id)}>Edit</Button>
      <Button onClick={() => onDelete(user.id)} danger>Delete</Button>
    </Card>
  );
};

// ✅ Good - Default props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const Button = ({
  variant = 'primary',
  size = 'medium',
}: ButtonProps) => {
  // component logic
};

// ✅ Good - children prop
interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <div className="layout">{children}</div>;
};
```

### Conditional Rendering

```typescript
// ✅ Good - Early return cho loading/error
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <Skeleton />;
  if (error) return <Alert message={error} />;
  if (!user) return <EmptyState />;

  return <Profile user={user} />;
}

// ✅ Good - Ternary cho simple conditions
const StatusBadge = ({ status }) => (
  <Tag color={status === 'active' ? 'green' : 'red'}>
    {status}
  </Tag>
);

// ✅ Good - && operator cho optional rendering
{isAuthenticated && <UserMenu />}

// ❌ Bad - Nested ternaries
const Label = ({ status }) =>
  status === 'active' ? 'Active' :
  status === 'pending' ? 'Pending' :
  status === 'rejected' ? 'Rejected' : 'Unknown';
```

---

## Naming Conventions

### Variables & Functions

```typescript
// ✅ Good - camelCase cho variables và functions
const userName = 'John';
const isLoading = false;
const handleSubmit = () => { ... };
const fetchUserData = async () => { ... };

// ✅ Good - Boolean variables có prefix
const isActive = true;
const hasPermission = true;
const canEdit = false;
const shouldRefresh = true;

// ✅ Good - Arrays có plural/suffix
const users = [];
const userList = [];
const selectedIds = [];

// ✅ Good - Functions mô tả action
const handleClick = () => { ... };
const handleSubmit = () => { ... };
const handleDelete = (id: number) => { ... };
const fetchData = async () => { ... };
const saveData = async (data: Data) => { ... };
```

### Files

```typescript
// ✅ Good - Components: PascalCase.tsx
// UserProfile.tsx
// JobCard.tsx
// PersonalInfoForm.tsx

// ✅ Good - Hooks: camelCase.ts
// usePermissions.ts
// useCompanyWithDomain.ts

// ✅ Good - Stores: camelCase.ts
// useAuthStore.ts
// useJobStore.ts

// ✅ Good - API files: camelCase.ts
// authApi.ts
// jobApi.ts
// companyApi.ts

// ✅ Good - Utils/constants: camelCase.ts hoặc SCREAMING_SNAKE_CASE.ts
// constants.ts
// API_CONFIG.ts
```

### CSS Classes (Tailwind)

```typescript
// ✅ Good - kebab-case, descriptive
<div className="flex items-center justify-between gap-4">
<div className="max-w-4xl mx-auto px-4 py-8">
<div className="text-center text-gray-600 text-sm">

// ✅ Good - Conditional classes
<Button
  className={cn(
    "px-4 py-2 rounded-lg",
    isActive && "bg-blue-500 text-white",
    !isActive && "bg-gray-200 text-gray-700"
  )}
/>

// ✅ Good - Reusable class names
<div className={styles.card}>
<div className={styles.header}>
<div className={styles.content}>
```

### Constants

```typescript
// ✅ Good - SCREAMING_SNAKE_CASE cho constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const API_TIMEOUT = 30000; // 30s
const DEFAULT_PAGE_SIZE = 20;

// ✅ Good - Enum-style objects
const USER_TYPES = {
  JOB_SEEKER: 'job_seeker',
  FREELANCER: 'freelancer',
  HR: 'hr',
} as const;

// ✅ Good - Status constants
const JOB_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft',
} as const;
```

---

## State Management

### Zustand Store

```typescript
// ✅ Good - Define interfaces đầy đủ
interface JobStore {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: number) => void;
  reset: () => void;
}

// ✅ Good - Create store với persist nếu cần
export const useJobStore = create<JobStore>()(
  persist(
    (set) => ({
      jobs: [],
      loading: false,
      error: null,
      filters: {},

      fetchJobs: async (filters) => {
        set({ loading: true });
        try {
          const data = await jobApi.getJobs(filters);
          set({ jobs: data, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch', loading: false });
        }
      },
      // ...
    }),
    {
      name: 'job-storage',
    }
  )
);
```

### useState & useEffect

```typescript
// ✅ Good - Typed useState
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(false);
const [count, setCount] = useState(0);

// ✅ Good - useEffect với dependency array đầy đủ
useEffect(() => {
  fetchUser(userId);
}, [userId]); // ✅ include all dependencies

// ✅ Good - Cleanup effects
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);

  return () => clearInterval(interval); // ✅ cleanup
}, [fetchData]);

// ❌ Bad - Empty dependency array không cần thiết
useEffect(() => {
  setLoading(true); // Chạy mỗi render
}, []);

// ❌ Bad - Missing dependencies
useEffect(() => {
  doSomething(value); // value not in deps
}, []); // ❌
```

### Selectors

```typescript
// ✅ Good - Individual selectors (tránh re-render)
const user = useAuthStore((state) => state.user);
const isLoading = useAuthStore((state) => state.isLoading);

// ✅ Good - Combined selectors
const { user, isLoading, error } = useAuthStore(
  (state) => ({
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
  })
);

// ❌ Bad - Select entire state
const store = useAuthStore(); // Re-render on any change
```

---

## API Calls

### API Structure

```typescript
// ✅ Good - Separate API files
// lib/jobApi.ts
export const jobApi = {
  getJobs: async (params?: GetJobsParams): Promise<Job[]> => {
    const response = await api.get('/api/jobs', { params });
    return response.data;
  },

  getJobById: async (id: number): Promise<Job> => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: CreateJobData): Promise<Job> => {
    const response = await api.post('/api/jobs', data);
    return response.data;
  },

  updateJob: async (id: number, data: UpdateJobData): Promise<Job> => {
    const response = await api.put(`/api/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id: number): Promise<void> => {
    await api.delete(`/api/jobs/${id}`);
  },
};
```

### Error Handling

```typescript
// ✅ Good - Try-catch với typed errors
const fetchJobs = async () => {
  try {
    const response = await api.get('/api/jobs');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded với error
      const message = error.response.data?.message || 'Server error';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Không thể kết nối server');
    } else {
      // Something else happened
      throw new Error('Đã xảy ra lỗi');
    }
  }
};

// ✅ Good - API call trong component với error handling
const MyComponent = () => {
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    try {
      const data = await jobApi.getJobs();
      setData(data);
    } catch (err: any) {
      setError(err.message);
      message.error(err.message);
    }
  };

  if (error) return <Alert message={error} />;
  // ...
};
```

### Axios Instance

```typescript
// ✅ Good - Centralized API instance
// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - token refresh
    if (error.response?.status === 401) {
      // ... refresh logic
    }
    return Promise.reject(error);
  }
);
```

---

## Styling

### Tailwind CSS

```typescript
// ✅ Good - Consistent spacing
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

// ✅ Good - Responsive prefixes
<div className="flex flex-col md:flex-row gap-4">
<div className="text-sm md:text-base">
<div className="hidden lg:block">

// ✅ Good - Conditional classes
<Button
  type={isPrimary ? 'primary' : 'default'}
  size={size === 'large' ? 'large' : 'middle'}
  className={cn(
    "rounded-lg font-medium",
    isActive && "bg-blue-500 text-white"
  )}
/>

// ✅ Good - Gradient classes
<h1 className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
```

### Ant Design

```typescript
// ✅ Good - Override styles via className
<Button
  className="h-14 font-medium text-base border-2 hover:border-red-400"
/>

// ✅ Good - Custom card styles
<Card
  className="border-0 shadow-xl rounded-2xl"
  styles={{ body: { padding: 24 } }}
/>

// ✅ Good - Size props
<Button size="large" />
<Input size="large" />
<Select size="large" />
```

### CSS Modules

```typescript
// ✅ Good - .module.css files
// Button.module.css
.button {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.primary {
  background: #3b82f6;
  color: white;
}

// Usage
import styles from './Button.module.css';

<button className={`${styles.button} ${styles.primary}`}>
  Click
</button>
```

---

## File Structure

### Component Organization

```
features/
├── jobs/
│   ├── index.tsx                 ← Feature export
│   ├── JobsListPage.tsx          ← Page component
│   ├── JobDetailPage.tsx
│   ├── api/
│   │   ├── jobApi.ts
│   │   └── jobDetailApi.ts
│   ├── store/
│   │   ├── useJobStore.ts
│   │   └── useJobDetailStore.ts
│   └── components/
│       ├── JobCard.tsx
│       ├── JobList.tsx
│       ├── JobFilters.tsx
│       ├── JobSearchBar.tsx
│       ├── JobDescription.tsx
│       └── ApplyModal.tsx
```

### Import Order

```typescript
// ✅ Good - Organized imports
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Next.js
import { useRouter } from 'next/router';
import Link from 'next/link';

// 3. Third-party (Ant Design, icons)
import { Button, Card, Input } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';

// 4. Internal (stores, hooks)
import { useAuthStore } from '@/store/useAuthStore';
import { usePermissions } from '@/hooks/usePermissions';

// 5. API
import { jobApi } from '@/lib/jobApi';

// 6. Components
import { JobCard } from './components/JobCard';

// 7. Utils/constants
import { JOB_STATUS } from '@/lib/constants';

// 8. Styles
import './JobList.css';
```

---

## Best Practices

### Performance

```typescript
// ✅ Good - Memo expensive computations
const expensiveValue = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// ✅ Good - Memo callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ Good - React.memo for pure components
const JobCard = React.memo(({ job, onSave }: JobCardProps) => {
  return <Card>{job.title}</Card>;
});

// ✅ Good - Lazy loading components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### Security

```typescript
// ✅ Good - Sanitize user input
import DOMPurify from 'dompurify';

const SanitizedContent = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);

// ✅ Good - Validate on client AND server
const isValidEmail = (email: string) => {
  const regex = /^[\w.-]+@[\w.-]+\.\w+$/;
  return regex.test(email);
};

// ❌ Bad - Never store sensitive data in localStorage
localStorage.setItem('password', 'secret'); // ❌
// ✅ - Token only, and prefer httpOnly cookies
```

### Accessibility

```typescript
// ✅ Good - Semantic HTML
<main>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
  <section aria-labelledby="jobs-heading">
    <h2 id="jobs-heading">Available Jobs</h2>
  </section>
</main>

// ✅ Good - Button vs Link
<button onClick={handleAction}>Action</button> {/* For actions */}
<Link href="/jobs">View Jobs</Link> {/* For navigation */}

// ✅ Good - Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Good - Loading states
<Button loading={isLoading}>Submit</Button>
```

### Error Boundaries

```typescript
// ✅ Good - Error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Alert message="Something went wrong" type="error" />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## Linting & Formatting

### ESLint Rules

```json
// eslint.config.mjs
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Config

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

---

## Git Commit Messages

```bash
# Format
<type>: <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, no logic change)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Maintenance tasks

# Examples
feat: add apply job modal
fix: resolve chat polling memory leak
docs: update API documentation
style: format job card component
refactor: extract usePermissions hook
```

---

## Checklist

Trước khi commit code:

- [ ] TypeScript types đầy đủ?
- [ ] ESLint không có errors?
- [ ] Component naming đúng convention?
- [ ] Props properly destructured?
- [ ] Error states handled?
- [ ] Loading states shown?
- [ ] Accessibility considerations?
- [ ] Performance (useMemo, useCallback) where needed?
- [ ] Commit message format đúng?
