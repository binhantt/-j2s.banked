# Permissions Guide

Hướng dẫn hệ thống phân quyền trong dự án Hove Giao Dien Users.

## User Types

Dự án có 3 loại người dùng:

| User Type | Tiếng Việt | Mô tả |
|-----------|-------------|--------|
| `job_seeker` | Ứng viên | Người tìm việc làm |
| `freelancer` | Freelancer | Người làm dự án tự do |
| `hr` | Nhà tuyển dụng | Người đăng tin tuyển dụng |

## Permissions Matrix

| Quyền | Mô tả | job_seeker | freelancer | hr |
|-------|-------|:-----------:|:-----------:|:---:|
| `canPostJob` | Đăng tin tuyển dụng | ❌ | ❌ | ✅ |
| `canApplyJob` | Ứng tuyển công việc | ✅ | ✅ | ❌ |
| `canCreateCV` | Tạo và quản lý CV | ✅ | ✅ | ❌ |
| `canPostFreelanceProject` | Đăng dự án freelance | ❌ | ❌ | ❌ |
| `canApplyFreelance` | Ứng tuyển dự án freelance | ✅ | ✅ | ❌ |

## Cách sử dụng

### 1. Trong Component (React Hook)

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { canPostJob, canApplyJob, canCreateCV, userType } = usePermissions();

  return (
    <div>
      {/* Chỉ hiện nút đăng tin cho HR */}
      {canPostJob && (
        <Button type="primary" icon={<PlusOutlined />}>
          Đăng tin tuyển dụng
        </Button>
      )}

      {/* Chỉ hiện nút ứng tuyển cho job_seeker và freelancer */}
      {canApplyJob && (
        <Button type="primary">
          Ứng tuyển ngay
        </Button>
      )}

      {/* Chỉ hiện nút tạo CV cho job_seeker và freelancer */}
      {canCreateCV && (
        <Link href="/cv-builder">
          Tạo CV Online
        </Link>
      )}

      <p>Loại tài khoản: {userType === 'job_seeker' ? 'Ứng viên' : userType === 'freelancer' ? 'Freelancer' : 'Nhà tuyển dụng'}</p>
    </div>
  );
}
```

### 2. Kiểm tra trong Code

```typescript
import { canPostJob, canApplyJob, PERMISSIONS } from '@/lib/permissions';

// Kiểm tra quyền cụ thể
if (canPostJob('hr')) {
  // HR có quyền đăng tin
}

// Lấy toàn bộ permissions
const permissions = PERMISSIONS['hr'];
console.log(permissions.canPostJob); // true
```

### 3. Bảo vệ Route

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Route chỉ dành cho HR
<ProtectedRoute requiredUserType="hr">
  <PostJobPage />
</ProtectedRoute>

// Route cho job_seeker và freelancer
<ProtectedRoute requiredUserType={['job_seeker', 'freelancer']}>
  <ApplyJobPage />
</ProtectedRoute>
```

### 4. Kiểm tra trong API Call

```typescript
import { useAuthStore } from '@/store/useAuthStore';
import { canPostJob } from '@/lib/permissions';

async function handlePostJob(data: JobData) {
  const { user } = useAuthStore.getState();

  // Kiểm tra quyền trước khi gọi API
  if (!user || !canPostJob(user.userType)) {
    message.error('Bạn không có quyền đăng tin tuyển dụng');
    return;
  }

  // Gọi API
  await jobApi.createJob(data);
}
```

## Helper Functions

```typescript
// lib/permissions.ts

canPostJob(userType: UserType): boolean
// → true nếu user có thể đăng tin

canApplyJob(userType: UserType): boolean
// → true nếu user có thể ứng tuyển

canCreateCV(userType: UserType): boolean
// → true nếu user có thể tạo CV

canPostFreelanceProject(userType: UserType): boolean
// → true nếu user có thể đăng dự án freelance

canApplyFreelance(userType: UserType): boolean
// → true nếu user có thể ứng tuyển freelance

getUserPermissions(userType: UserType): Permission
// → Lấy object permissions đầy đủ
```

## Ví dụ thực tế

### Trang danh sách việc làm (JobsFeature)

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

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

### Trang profile

```tsx
import { usePermissions } from '@/hooks/usePermissions';

export const ProfilePage = () => {
  const { userType } = usePermissions();

  return (
    <div>
      <ProfileHeader user={user} />

      {/* HR thấy form thông tin công ty */}
      {userType === 'hr' && <CompanyInfoForm />}

      {/* Job seeker và freelancer thấy form thông tin cá nhân */}
      {(userType === 'job_seeker' || userType === 'freelancer') && (
        <PersonalInfoForm />
      )}
    </div>
  );
};
```

### Navbar động

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';

export const Navbar = () => {
  const { isAuthenticated, canPostJob } = useAuthStore();
  const { userType } = usePermissions();

  return (
    <nav>
      <Link href="/jobs">Việc làm</Link>
      <Link href="/freelance">Freelance</Link>

      {/* Chỉ HR thấy menu quản lý */}
      {isAuthenticated && userType === 'hr' && (
        <>
          <Link href="/company/blogs">Blog công ty</Link>
          <Link href="/company/images">Hình ảnh</Link>
        </>
      )}

      {/* Chỉ job_seeker và freelancer thấy CV Builder */}
      {(userType === 'job_seeker' || userType === 'freelancer') && (
        <Link href="/cv-builder">Tạo CV</Link>
      )}
    </nav>
  );
};
```

## ProtectedRoute Component

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Ví dụ 1: Yêu cầu đăng nhập
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>

// Ví dụ 2: Yêu cầu userType cụ thể
<ProtectedRoute requiredUserType="hr">
  <PostJobPage />
  <JobApplicationsPage />
  <CompanyBlogManagement />
</ProtectedRoute>

// Ví dụ 3: Cho phép nhiều userType
<ProtectedRoute requiredUserType={['job_seeker', 'freelancer']}>
  <ApplyJobPage />
  <CVBuilderPage />
</ProtectedRoute>
```

## Redirect khi không có quyền

ProtectedRoute sẽ tự động redirect:

| Trường hợp | Redirect đến |
|-----------|-------------|
| Chưa đăng nhập | `/login` |
| Sai userType | `/` (trang chủ) |

## User Flow

### Ứng viên (job_seeker)

```
1. Đăng ký/Đăng nhập → Chọn "Ứng viên"
2. Tạo CV → /cv-builder
3. Tìm việc → /jobs
4. Ứng tuyển → ApplyModal
5. Theo dõi đơn → /applications/my-applications
6. Nhận thông báo → Chat, Notifications
```

### Freelancer

```
1. Đăng ký/Đăng nhập → Chọn "Freelancer"
2. Tạo CV → /cv-builder
3. Upload certificates → Bắt buộc để ứng tuyển freelance
4. Tìm dự án → /freelance
5. Ứng tuyển dự án → ApplyProjectModal
6. Theo dõi tiến độ → ProjectProgressTracker
```

### Nhà tuyển dụng (HR)

```
1. Đăng ký/Đăng nhập → Chọn "Nhà tuyển dụng"
2. Tạo công ty → /profile (CompanyInfoForm)
3. Đăng tin tuyển dụng → /jobs/post
4. Quản lý tin → /jobs/my-jobs
5. Xem ứng viên → /applications/job/[jobId]
6. Nhắn tin → /chat
7. Quản lý blog công ty → /company/blogs
```
