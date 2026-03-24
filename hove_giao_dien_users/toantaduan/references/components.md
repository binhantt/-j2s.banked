# Components Reference

Tài liệu tham khảo các components trong dự án Hove Giao Dien Users.

## Layout Components

### MainLayout

Layout chính bao gồm Navbar và Footer.

```tsx
import { MainLayout } from '@/components/layout/MainLayout';

<MainLayout>
  <PageContent />
</MainLayout>
```

### Navbar

Thanh điều hướng chính.

**Props:** Không có (sử dụng auth store tự động)

**Features:**
- Hiển thị menu theo trạng thái đăng nhập
- Notifications dropdown
- User menu dropdown
- Responsive mobile menu
- Badge count cho thư mục lưu và thông báo

**States:**
- Chưa đăng nhập: Hiện nút "Đăng nhập"
- Đã đăng nhập: Hiện notifications, avatar, user menu

### Footer

Footer của trang.

```tsx
import { Footer } from '@/components/layout/Footer';

<Footer />
```

---

## Common Components

### EmptyState

Hiển thị khi không có dữ liệu.

```tsx
import { EmptyState } from '@/components/common';

<EmptyState
  title="Không có dữ liệu"
  description="Chưa có việc làm nào phù hợp"
  icon={<SearchOutlined />}
/>
```

### LoadingState

Hiển thị trạng thái loading.

```tsx
import { LoadingState } from '@/components/common';

<LoadingState text="Đang tải dữ liệu..." />
```

### PageContainer

Container wrapper cho trang.

```tsx
import { PageContainer } from '@/components/common';

<PageContainer title="Trang chủ">
  <Content />
</PageContainer>
```

### SectionTitle

Tiêu đề section.

```tsx
import { SectionTitle } from '@/components/common';

<SectionTitle
  title="Việc làm nổi bật"
  subtitle="Những công việc được ứng viên quan tâm nhất"
/>
```

### StatsCard

Card hiển thị thống kê.

```tsx
import { StatsCard } from '@/components/common';

<StatsCard
  title="Việc làm"
  value={150}
  icon={<BriefcaseOutlined />}
  trend="+12%"
  trendUp={true}
/>
```

---

## Auth Components

### ProtectedRoute

Route bảo vệ yêu cầu đăng nhập hoặc quyền cụ thể.

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Yêu cầu đăng nhập
<ProtectedRoute>
  <PrivatePage />
</ProtectedRoute>

// Yêu cầu userType cụ thể
<ProtectedRoute requiredUserType="hr">
  <HRDashboard />
</ProtectedRoute>
```

---

## Form Components

### PersonalInfoForm

Form thông tin cá nhân cho profile.

**Props:**
```typescript
interface PersonalInfoFormProps {
  isEditing: boolean;        // Chế độ chỉnh sửa
  onSaveSuccess?: () => void; // Callback khi lưu thành công
}
```

**Features:**
- Input fields: name, email, phone, bio, currentPosition
- Domain select (searchable)
- GPS location (navigator.geolocation)
- Certificate upload
- Validation

**Usage:**
```tsx
<PersonalInfoForm
  isEditing={isEditing}
  onSaveSuccess={() => setIsEditing(false)}
/>
```

### CVUpload

Component upload CV.

```tsx
import { CVUpload } from '@/components';

<CVUpload
  userId={user.id}
  onUploadSuccess={(url) => setCvUrl(url)}
/>
```

### CertificateUpload

Component upload chứng chỉ/bằng cấp.

```tsx
import CertificateUpload from '@/components/CertificateUpload';

<CertificateUpload
  userId={user?.id || 0}
  currentImages={certificateImages}
  onImagesChange={setCertificateImages}
/>
```

### AvatarUpload

Component upload avatar.

```tsx
import AvatarUpload from '@/components/AvatarUpload';

<AvatarUpload
  userId={user.id}
  currentAvatar={user.avatarUrl}
  onUploadSuccess={(url) => updateAvatar(url)}
/>
```

---

## Job Components

### JobCard

Card hiển thị thông tin việc làm.

```tsx
import { JobCard } from '@/features/jobs/components';

<JobCard
  job={{
    id: 1,
    title: "Senior React Developer",
    companyName: "Tech Corp",
    salaryMin: 1000,
    salaryMax: 2000,
    location: "Ho Chi Minh"
  }}
  onSave={() => handleSave(job.id)}
/>
```

### ApplyModal

Modal ứng tuyển công việc.

```tsx
import { ApplyModal } from '@/features/jobs/components';

<ApplyModal
  visible={showModal}
  jobId={job.id}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    message.success("Ứng tuyển thành công!");
    setShowModal(false);
  }}
/>
```

### JobSearchBar

Thanh tìm kiếm việc làm.

```tsx
import { JobSearchBar } from '@/features/jobs/components';

<JobSearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={(value) => fetchJobs(value)}
/>
```

### JobFilters

Bộ lọc việc làm.

```tsx
import { JobFilters } from '@/features/jobs/components';

<JobFilters
  filters={filters}
  onChange={setFilters}
  onReset={() => resetFilters()}
/>
```

### JobDescription

Component hiển thị mô tả công việc.

```tsx
import { JobDescription } from '@/features/jobs/components';

<JobDescription
  description={job.description}
  requirements={job.requirements}
/>
```

---

## Company Components

### CompanyCard

Card hiển thị thông tin công ty.

```tsx
import { CompanyCard } from '@/features/companies/components';

<CompanyCard
  company={company}
  onSave={() => handleSave(company.id)}
/>
```

### CompanyInfo

Component hiển thị thông tin công ty chi tiết.

```tsx
import CompanyInfo from '@/components/CompanyInfo';

<CompanyInfo
  company={company}
  showActions={true}
/>
```

### CompanyReviewSection

Section đánh giá công ty.

```tsx
import { CompanyReviewSection } from '@/features/companies';

<CompanyReviewSection companyId={company.id} />
```

---

## Chat Components

### ChatPage

Trang chat chính.

```tsx
import ChatPage from '@/features/chat/ChatPage';

<MainLayout>
  <ChatPage />
</MainLayout>
```

**Features:**
- Danh sách cuộc trò chuyện
- Tin nhắn real-time (poll 3s)
- Reply tin nhắn
- Gửi ảnh
- Đánh dấu đã đọc

---

## Application Components

### MyApplicationsPage

Trang quản lý đơn ứng tuyển của ứng viên.

```tsx
import MyApplicationsPage from '@/features/applications/MyApplicationsPage';

<MainLayout>
  <MyApplicationsPage />
</MainLayout>
```

### JobApplicationsPage

Trang xem ứng viên ứng tuyển (HR only).

```tsx
import { JobApplicationsPage } from '@/features/applications';

<MainLayout>
  <JobApplicationsPage jobId={job.id} />
</MainLayout>
```

### CandidateProfileView

Component xem profile ứng viên (HR).

```tsx
import { CandidateProfileView } from '@/features/applications';

<CandidateProfileView userId={userId} />
```

---

## CV Components

### CVBuilderFeature

Feature tạo CV online.

```tsx
import { CVBuilderFeature } from '@/features/cv-builder';

<MainLayout>
  <CVBuilderFeature />
</MainLayout>
```

**Sections:**
- Thông tin cá nhân
- Kinh nghiệm làm việc (add/remove)
- Học vấn (add/remove)
- Kỹ năng (với Rate)
- Preview mode
- Export PDF (TODO)

### CVAccessButton

Nút truy cập CV.

```tsx
import { CVAccessButton } from '@/components';

<CVAccessButton userId={userId} />
```

### HRCVViewer

Component HR xem CV ứng viên.

```tsx
import HRCVViewer from '@/components/HRCVViewer';

<HRCVViewer cvUrl={cvUrl} />
```

---

## Freelance Components

### FreelanceCard

Card hiển thị dự án freelance.

```tsx
import { FreelanceCard } from '@/features/freelance/components';

<FreelanceCard
  project={project}
  onApply={() => handleApply(project.id)}
/>
```

### CreateProjectModal

Modal tạo dự án freelance (HR).

```tsx
import { CreateProjectModal } from '@/features/freelance';

<CreateProjectModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    message.success("Tạo dự án thành công!");
    setShowModal(false);
    fetchProjects();
  }}
/>
```

### ApplyProjectModal

Modal ứng tuyển dự án freelance.

```tsx
import { ApplyProjectModal } from '@/features/freelance';

<ApplyProjectModal
  visible={showModal}
  projectId={project.id}
  onClose={() => setShowModal(false)}
/>
```

### ProjectProgressTracker

Component theo dõi tiến độ dự án.

```tsx
import { ProjectProgressTracker } from '@/features/freelance';

<ProjectProgressTracker
  projectId={project.id}
  currentProgress={50}
/>
```

---

## Blog Components

### BlogCard

Card hiển thị bài blog.

```tsx
import { BlogCard } from '@/features/blog/components';

<BlogCard
  blog={blog}
  onClick={() => router.push(`/blog/${blog.id}`)}
/>
```

### BlogList

Component danh sách blog.

```tsx
import { BlogList } from '@/features/blog/components';

<BlogList
  blogs={blogs}
  loading={loading}
  onLoadMore={loadMore}
/>
```

### CompanyBlogSection

Section blog của công ty.

```tsx
import { CompanyBlogSection } from '@/features/blog/components';

<CompanyBlogSection companyId={company.id} />
```

---

## Notification Components

Sử dụng trong Navbar, không cần import riêng.

**Notification types:**
- `application_accepted` - Đơn được chấp nhận (green check)
- `application_rejected` - Đơn bị từ chối (red x)
- default - Thông báo thường (blue bell)

---

## Utility Components

### SaveJobButton

Nút lưu/bỏ lưu việc làm.

```tsx
import { SaveJobButton } from '@/components';

<SaveJobButton jobId={job.id} />
```

### SaveCompanyButton

Nút lưu/bỏ lưu công ty.

```tsx
import { SaveCompanyButton } from '@/components';

<SaveCompanyButton companyId={company.id} />
```

### JobCompanyBadge

Badge hiển thị logo và tên công ty.

```tsx
import { JobCompanyBadge } from '@/components';

<JobCompanyBadge
  logo={company.logo}
  name={company.name}
/>
```

### DomainDisplay

Component hiển thị lĩnh vực/domain.

```tsx
import { DomainDisplay } from '@/components';

<DomainDisplay domain={domain} />
```

---

## Styling

### Tailwind Classes thường dùng

```tsx
// Layout
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

// Cards
<Card className="rounded-2xl shadow-lg border border-gray-200">

// Gradient text
<h1 className="text-5xl font-bold bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">

// Buttons
<Button type="primary" size="large" icon={<PlusOutlined />}>
```

### Ant Design Overrides

```tsx
// Custom button styles
<Button
  className="h-14 font-medium text-base border-2 border-gray-200 hover:border-red-400"
/>

// Card styles
<Card
  className="border-0 shadow-xl rounded-2xl"
  styles={{ body: { padding: 24 } }}
/>
```
