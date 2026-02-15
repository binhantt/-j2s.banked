import MyApplicationsPage from '@/features/applications/MyApplicationsPage';
import { MainLayout } from '@/components/layout/MainLayout';

export default function MyApplicationsPageWithLayout() {
  return (
    <MainLayout>
      <MyApplicationsPage />
    </MainLayout>
  );
}
