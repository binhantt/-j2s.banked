import { Avatar, Button, Space } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
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
}

export const JobDetailHeader = ({
  job,
  onApply,
  onSave,
  canApply,
  hasApplied
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
                  disabled={hasApplied || isJobClosed}
                  style={{
                    minWidth: 180,
                    background: hasApplied || isJobClosed ? '#f1f5f9' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    boxShadow: hasApplied || isJobClosed ? 'none' : '0 4px 12px rgba(22,163,74,0.15)',
                  }}
                >
                  {hasApplied ? 'Đã ứng tuyển' : isJobClosed ? 'Đã đóng' : 'Ứng tuyển ngay'}
                </Button>
              )}
              <Button
                size="large"
                icon={<HeartOutlined />}
                onClick={onSave}
                style={{
                  borderRadius: 12,
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  fontWeight: 600,
                }}
              >
                Lưu tin
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
