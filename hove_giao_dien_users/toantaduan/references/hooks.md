# Hooks Reference

Tài liệu tham khảo custom hooks trong dự án Hove Giao Dien Users.

## Cấu trúc

```
hooks/
├── usePermissions.ts         ← Kiểm tra quyền user
└── useCompanyWithDomain.ts   ← Lấy company kèm domain info
```

---

## usePermissions

Hook kiểm tra quyền của user dựa trên userType.

### Import

```tsx
import { usePermissions } from '@/hooks/usePermissions';
```

### Return Type

```typescript
interface UsePermissionsReturn extends Permission {
  userType: string | null;
}
```

### Permission Interface

```typescript
interface Permission {
  canPostJob: boolean;          // Đăng tin tuyển dụng
  canApplyJob: boolean;         // Ứng tuyển công việc
  canCreateCV: boolean;         // Tạo CV
  canPostFreelanceProject: boolean; // Đăng dự án freelance
  canApplyFreelance: boolean;   // Ứng tuyển freelance
}
```

### Cách sử dụng

```tsx
function MyComponent() {
  const {
    userType,
    canPostJob,
    canApplyJob,
    canCreateCV,
    canPostFreelanceProject,
    canApplyFreelance,
  } = usePermissions();

  return (
    <div>
      <p>User Type: {userType}</p>

      {canPostJob && <PostJobButton />}
      {canApplyJob && <ApplyJobButton />}
      {canCreateCV && <CVBuilderLink />}
      {canApplyFreelance && <FreelanceProjectsLink />}
    </div>
  );
}
```

### Ví dụ: JobsFeature

```tsx
// features/jobs/index.tsx
import { JobList } from './components/JobList';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/router';

export const JobsFeature = () => {
  const { canPostJob } = usePermissions();
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Danh sách việc làm</h1>

        {/* Chỉ HR mới thấy nút đăng tin */}
        {canPostJob && (
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push('/jobs/post')}
          >
            Đăng tin tuyển dụng
          </Button>
        )}
      </div>

      <JobList />
    </div>
  );
};
```

### Ví dụ: Navbar Menu

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/useAuthStore';

export const Navbar = () => {
  const { isAuthenticated } = useAuthStore();
  const { userType } = usePermissions();

  const menuItems = [
    { key: 'jobs', label: 'Việc làm', href: '/jobs' },
    { key: 'freelance', label: 'Freelance', href: '/freelance' },
    { key: 'companies', label: 'Công ty', href: '/companies' },
  ];

  // Thêm menu cho HR
  if (isAuthenticated && userType === 'hr') {
    menuItems.push(
      { key: 'my-jobs', label: 'Tin của tôi', href: '/jobs/my-jobs' },
      { key: 'company-blog', label: 'Blog công ty', href: '/company/blogs' }
    );
  }

  // Thêm menu cho job_seeker/freelancer
  if (isAuthenticated && (userType === 'job_seeker' || userType === 'freelancer')) {
    menuItems.push(
      { key: 'cv-builder', label: 'Tạo CV', href: '/cv-builder' },
      { key: 'my-applications', label: 'Đơn ứng tuyển', href: '/applications/my-applications' }
    );
  }

  return <nav>{menuItems.map(/* render menu */)}</nav>;
};
```

### Ví dụ: Profile Page

```tsx
import { usePermissions } from '@/hooks/usePermissions';

export const ProfilePage = () => {
  const { userType } = usePermissions();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader />

      {/* HR: Quản lý thông tin công ty */}
      {userType === 'hr' && (
        <>
          <CompanyInfoForm />
          <JobPostingManagementSection />
          <CompanyBlogSection />
          <ImageGalleryManagement />
        </>
      )}

      {/* Job Seeker: Quản lý CV và thông tin cá nhân */}
      {userType === 'job_seeker' && (
        <>
          <PersonalInfoForm />
          <ExperienceManagement />
          <EducationManagement />
          <CVManagement />
        </>
      )}

      {/* Freelancer: Tương tự job seeker + freelance management */}
      {userType === 'freelancer' && (
        <>
          <PersonalInfoForm />
          <ExperienceManagement />
          <EducationManagement />
          <CVManagement />
          <FreelanceManagement />
        </>
      )}
    </div>
  );
};
```

### Ví dụ: Conditional Actions

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { Button, Space } from 'antd';

export const JobDetailActions = ({ job }) => {
  const { canApplyJob, canPostJob } = usePermissions();

  return (
    <Space>
      <SaveJobButton jobId={job.id} />

      {/* HR thấy nút quản lý, không thấy nút ứng tuyển */}
      {canPostJob && (
        <Button onClick={() => router.push(`/jobs/edit/${job.id}`)}>
          Chỉnh sửa tin
        </Button>
      )}

      {/* Job seeker và freelancer thấy nút ứng tuyển */}
      {canApplyJob && (
        <Button type="primary" onClick={() => setShowApplyModal(true)}>
          Ứng tuyển ngay
        </Button>
      )}
    </Space>
  );
};
```

### Khi chưa đăng nhập

```tsx
// Khi chưa đăng nhập, tất cả permissions = false
function TestPermissions() {
  const { userType } = usePermissions();

  console.log(userType); // null
  console.log(canApplyJob); // false
  console.log(canPostJob); // false

  return (
    <div>
      <p>Bạn chưa đăng nhập</p>
      <Button onClick={() => router.push('/login')}>
        Đăng nhập để tiếp tục
      </Button>
    </div>
  );
}
```

---

## useCompanyWithDomain

Hook lấy thông tin công ty kèm domain info.

### Import

```tsx
import { useCompanyWithDomain } from '@/hooks/useCompanyWithDomain';
```

### Parameters

```typescript
interface UseCompanyWithDomainParams {
  companyId: number;
  domainId?: number; // optional
}
```

### Return Type

```typescript
interface UseCompanyWithDomainReturn {
  company: Company | null;
  domain: Domain | null;
  loading: boolean;
  error: string | null;
}
```

### Domain Interface

```typescript
interface Domain {
  id: number;
  name: string;
  description?: string;
}
```

### Cách sử dụng

```tsx
function CompanyCard({ companyId }) {
  const { company, domain, loading, error } = useCompanyWithDomain({
    companyId,
  });

  if (loading) return <Skeleton />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card>
      <h3>{company?.name}</h3>
      <Tag>{domain?.name}</Tag>
      <p>{company?.description}</p>
    </Card>
  );
}
```

### Ví dụ: Company Detail

```tsx
import { useCompanyWithDomain } from '@/hooks/useCompanyWithDomain';
import { Card, Tag, Descriptions, Tabs } from 'antd';

export const CompanyDetailFeature = ({ companyId }) => {
  const { company, domain, loading, error } = useCompanyWithDomain({
    companyId,
  });

  if (loading) return <LoadingState />;
  if (error) return <EmptyState description={error} />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex gap-6">
          <Avatar src={company?.logo} size={100} />
          <div>
            <h1 className="text-2xl font-bold">{company?.name}</h1>
            <Tag color="blue">{domain?.name}</Tag>
            <p>{company?.address}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        items={[
          { key: 'about', label: 'Giới thiệu', children: <p>{company?.description}</p> },
          { key: 'jobs', label: 'Việc làm', children: <CompanyJobs companyId={companyId} /> },
          { key: 'reviews', label: 'Đánh giá', children: <CompanyReviews companyId={companyId} /> },
          { key: 'blogs', label: 'Blog', children: <CompanyBlogs companyId={companyId} /> },
        ]}
      />
    </div>
  );
};
```

---

## Tạo Custom Hook mới

### Template

```typescript
// hooks/useCustomHook.ts
import { useState, useEffect, useCallback } from 'react';

interface UseCustomHookOptions {
  param1?: string;
  param2?: number;
}

interface UseCustomHookReturn {
  data: DataType | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomHook(options: UseCustomHookOptions): UseCustomHookReturn {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await someApi.getData(options);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [options.param1, options.param2]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
```

### Ví dụ: useJobApplications

```typescript
// hooks/useJobApplications.ts
import { useState, useEffect, useCallback } from 'react';
import { applicationApi } from '@/lib/applicationApi';

interface UseJobApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  acceptApplication: (id: number) => Promise<void>;
  rejectApplication: (id: number) => Promise<void>;
}

export function useJobApplications(jobId: number): UseJobApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await applicationApi.getJobApplications(jobId);
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const acceptApplication = async (id: number) => {
    try {
      await applicationApi.updateStatus(id, { status: 'accepted' });
      await fetchApplications();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const rejectApplication = async (id: number) => {
    try {
      await applicationApi.updateStatus(id, { status: 'rejected' });
      await fetchApplications();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to reject');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    acceptApplication,
    rejectApplication,
  };
}
```

### Sử dụng hook mới

```tsx
// features/applications/JobApplicationsPage.tsx
import { useJobApplications } from '@/hooks/useJobApplications';
import { Table, Button, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

export const JobApplicationsPage = ({ jobId }) => {
  const {
    applications,
    loading,
    acceptApplication,
    rejectApplication,
  } = useJobApplications(jobId);

  const handleAccept = async (id: number) => {
    try {
      await acceptApplication(id);
      message.success('Đã chấp nhận ứng viên');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectApplication(id);
      message.success('Đã từ chối ứng viên');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Tên', dataIndex: 'userName' },
    { title: 'Email', dataIndex: 'userEmail' },
    {
      title: 'Hành động',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleAccept(record.id)}
          >
            Chấp nhận
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record.id)}
          >
            Từ chối
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Danh sách ứng viên</h1>
      <Table
        columns={columns}
        dataSource={applications}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};
```

---

## Best Practices

### 1. Đặt tên theo convention

```typescript
// ✅ Correct
usePermissions
useJobStore
useCompanyWithDomain

// ❌ Wrong
getPermissions
fetchJobsStore
companyDomain
```

### 2. Luôn return object có properties rõ ràng

```typescript
// ✅ Good - rõ ràng, typed
return {
  data,
  loading,
  error,
  refetch,
};

// ❌ Bad - không clear
return data;
```

### 3. Sử dụng useCallback cho functions

```typescript
// ✅ Good - stable reference
const handleAction = useCallback(async () => {
  await doSomething(id);
}, [id]);

// ❌ Bad - tạo function mới mỗi render
const handleAction = async () => {
  await doSomething(id);
};
```

### 4. Cleanup trong useEffect

```typescript
// ✅ Good - cleanup
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 3000);

  return () => clearInterval(interval);
}, [fetchData]);

// ❌ Bad - memory leak
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 3000);
  // Không cleanup!
}, [fetchData]);
```

### 5. Handle loading và error states

```tsx
// ✅ Good
function MyComponent() {
  const { data, loading, error } = useCustomHook();

  if (loading) return <Skeleton />;
  if (error) return <Alert message={error} type="error" />;
  if (!data) return null;

  return <div>{/* render data */}</div>;
}

// ❌ Bad - không handle edge cases
function MyComponent() {
  const { data } = useCustomHook();
  return <div>{data.map(/*...*/)}</div>; // Có thể crash nếu data = null
```
