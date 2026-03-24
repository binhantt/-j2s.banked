import { useEffect } from 'react';
import { Card, Spin, message, Modal } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedItemsStore } from './store/useSavedItemsStore';
import { SavedItemsTabs } from './components/SavedItemsTabs';

export const SavedItemsFeature = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    savedCompanies,
    savedJobs,
    loadingCompanies,
    loadingJobs,
    fetchSavedCompanies,
    fetchSavedJobs,
    unsaveCompany,
    unsaveJob,
  } = useSavedItemsStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchSavedCompanies(user.id);
      fetchSavedJobs(user.id);
    }
  }, [isAuthenticated, user?.id, router, fetchSavedCompanies, fetchSavedJobs]);

  const confirmUnsaveCompany = (companyId: number, companyName: string) => {
    if (!user?.id) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu công ty "${companyName}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await unsaveCompany(user.id, companyId);
          message.success('Đã bỏ lưu công ty');
          fetchSavedCompanies(user.id);
        } catch (error) {
          console.error('Error unsaving company:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const confirmUnsaveJob = (jobId: number, jobTitle: string) => {
    if (!user?.id) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu việc làm "${jobTitle}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await unsaveJob(user.id, jobId);
          message.success('Đã bỏ lưu việc làm');
          fetchSavedJobs(user.id);
        } catch (error) {
          console.error('Error unsaving job:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  if (!user) return null;

  const totalItems = savedJobs.length + savedCompanies.length;

  return (
    <MainLayout>
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
          borderBottom: '1px solid #dcfce7',
          padding: '64px 0 48px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: -50, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(22,163,74,0.05) 0%, transparent 70%)',
          }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, 
              padding: '6px 16px', borderRadius: 100, background: '#f0fdf4', 
              border: '1px solid #dcfce7', marginBottom: 20 
            }}>
              <HeartFilled style={{ color: '#16a34a', fontSize: 14 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quản lý mục đã lưu
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Thư mục <span style={{ color: '#16a34a' }}>Yêu thích</span>
            </h1>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600 }}>
              Lưu giữ những cơ hội nghề nghiệp và doanh nghiệp bạn quan tâm nhất. Tiếp cận và ứng tuyển bất cứ lúc nào.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: '32px 32px 48px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)',
          }}>
            <SavedItemsTabs
              loadingJobs={loadingJobs}
              loadingCompanies={loadingCompanies}
              savedJobs={savedJobs}
              savedCompanies={savedCompanies}
              onViewJob={(id) => router.push(`/jobs/${id}`)}
              onUnsaveJob={confirmUnsaveJob}
              onViewCompany={(id) => router.push(`/companies/${id}`)}
              onUnsaveCompany={confirmUnsaveCompany}
              onGoJobs={() => router.push('/jobs')}
              onGoCompanies={() => router.push('/companies')}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
