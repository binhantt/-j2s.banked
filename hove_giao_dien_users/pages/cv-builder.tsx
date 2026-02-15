import { CVBuilderFeature } from '@/features/cv-builder';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CVBuilderPage() {
  return (
    <MainLayout>
      <ProtectedRoute allowedUserTypes={['job_seeker', 'freelancer']}>
        <CVBuilderFeature />
      </ProtectedRoute>
    </MainLayout>
  );
}
