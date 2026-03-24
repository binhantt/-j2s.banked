import { MainLayout } from '@/components/layout/MainLayout';
import CompanyBlogManagement from '@/features/blog/CompanyBlogManagement';

export default function CompanyBlogPage() {
  return (
    <MainLayout>
      <CompanyBlogManagement />
    </MainLayout>
  );
}