import { Avatar, Button, Space } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';

interface JobDetailHeaderProps {
  job: any;
  onApply: () => void;
  onSave: () => void;
  canApply: boolean;
  hasApplied: boolean;
  /** True khi đơn trước bị rejected → cho phép ứng tuyển lại */
  isRejected?: boolean;
  isSaved?: boolean;
  saveLoading?: boolean;
}

export const JobDetailHeader = ({
  job,
  onApply,
  onSave,
  canApply,
  hasApplied,
  isRejected = false,
  isSaved = false,
  saveLoading = false,
}: JobDetailHeaderProps) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const jobTypeMap: any = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Intern',
  };

  const levelMap: any = {
    'intern': 'Intern',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'lead': 'Lead',
    'manager': 'Manager',
  };

  const isJobClosed = job.status === 'closed' || (job.maxApplicants && job.applications >= job.maxApplicants);
  const isOwner = user?.id === job.userId;

  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      <Avatar
        size={80}
        shape="square"
        src={job.companyLogoUrl}
        style={{
          background: job.companyLogoUrl ? 'transparent' : '#f0fdf4',
          color: '#16a34a',
          fontSize: 32,
          fontWeight: 700,
          border: '1px solid #f0fdf4',
          flexShrink: 0,
        }}
      >
        {!job.companyLogoUrl && (job.companyName?.charAt(0) || job.title.charAt(0))}
      </Avatar>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#0b1220' }}>
          {job.title}
        </h1>
        <p style={{ fontSize: 16, color: '#16a34a', marginBottom: 12, fontWeight: 600 }}>
          {job.companyName || 'Acgen'}
        </p>
        <Space size={[16, 8]} wrap>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <span>📍</span>
            <span>Địa điểm: {job.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <span>💰</span>
            <span>Mức lương: {job.salaryMin} - {job.salaryMax}</span>
          </div>
        </Space>
        <Space size={[16, 8]} wrap style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <ClockCircleOutlined style={{ color: '#16a34a' }} />
            <span>Hình thức: {jobTypeMap[job.jobType]} • {levelMap[job.level]}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <span>👥</span>
            <span>{job.applications || 0} ứng viên</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
            <span>👁️</span>
            <span>{job.views || 0} lượt xem</span>
          </div>
        </Space>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {isOwner ? (
            <>
              <Button
                type="primary"
                size="large"
                icon={<UserOutlined />}
                onClick={() => router.push(`/applications/job/${job.id}`)}
                style={{
                  minWidth: 180,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(22,163,74,0.15)',
                }}
              >
                Xem ứng viên ({job.applications || 0})
              </Button>
              <Button
                size="large"
                icon={<EditOutlined />}
                onClick={() => router.push(`/jobs/edit/${job.id}`)}
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                Chỉnh sửa tin
              </Button>
            </>
          ) : (
            <>
              {canApply && (
                <Button
                  type="primary"
                  size="large"
                  onClick={onApply}
                  disabled={(!hasApplied || isRejected) ? false : isJobClosed}
                  style={{
                    minWidth: 180,
                    background:
                      isJobClosed ? '#f1f5f9' :
                      isRejected ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                      hasApplied ? '#f1f5f9' :
                      'linear-gradient(135deg, #16a34a, #22c55e)',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    boxShadow:
                      isJobClosed ? 'none' :
                      isRejected ? '0 4px 12px rgba(245,158,11,0.25)' :
                      hasApplied ? 'none' :
                      '0 4px 12px rgba(22,163,74,0.15)',
                  }}
                >
                  {isJobClosed ? 'Đã đóng' : isRejected ? 'Ứng tuyển lại' : hasApplied ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}
                </Button>
              )}
              <Button
                size="large"
                icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                onClick={onSave}
                loading={saveLoading}
                style={{
                  borderRadius: 12,
                  borderColor: isSaved ? '#16a34a' : '#d1d5db',
                  background: isSaved ? '#f0fdf4' : 'transparent',
                  color: '#16a34a',
                  fontWeight: 600,
                }}
              >
                {isSaved ? 'Đã lưu' : 'Lưu tin'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
