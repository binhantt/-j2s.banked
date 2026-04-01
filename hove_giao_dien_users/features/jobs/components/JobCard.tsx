import { Card, Tag, Button } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ThunderboltOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { Job } from '../api/jobApi';

export type JobCardAppStatus = '' | 'pending' | 'reviewing' | 'accepted' | 'rejected';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSaveToggle?: (jobId: number) => void;
  /** Trạng thái đơn ứng tuyển của user hiện tại với job này */
  applicationStatus?: JobCardAppStatus;
}

const jobTypeMap: Record<string, string> = {
  'full-time': 'Toàn thời gian',
  'part-time': 'Bán thời gian',
  'contract': 'Hợp đồng',
  'internship': 'Thực tập',
};

// Format experienceYearsMin (INT) to display text
const formatExperience = (experienceYearsMin: number | undefined | null, experience: string | undefined): string => {
  if (experienceYearsMin !== undefined && experienceYearsMin !== null) {
    if (experienceYearsMin === 0) return 'Không yêu cầu';
    if (experienceYearsMin === 1) return '1 năm';
    if (experienceYearsMin === 2) return '2 năm';
    if (experienceYearsMin === 3) return '3 năm';
    if (experienceYearsMin === 5) return '5 năm';
    if (experienceYearsMin === 7) return '7+ năm';
    return `${experienceYearsMin} năm`;
  }
  // Fallback to legacy String field
  if (experience) return experience;
  return 'Không yêu cầu';
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const posted = new Date(date);
  const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return '1 ngày trước';
  return `${days} ngày trước`;
};

export default function JobCard({ job, isSaved = false, onSaveToggle, applicationStatus }: JobCardProps) {
  const router = useRouter();

  const hasApplied = applicationStatus !== '' && applicationStatus !== undefined;
  const isRejected = applicationStatus === 'rejected';

  const getApplyButtonText = () => {
    if (isRejected) return 'Ứng tuyển lại';
    if (hasApplied) return 'Đã ứng tuyển';
    return 'Ứng tuyển ngay';
  };

  const getApplyButtonStyle = (): React.CSSProperties => {
    if (isRejected) {
      return {
        height: 40,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: 'none',
        fontWeight: 700,
        fontSize: 14,
        paddingInline: 24,
        boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
        color: '#fff',
      };
    }
    if (hasApplied) {
      return {
        height: 40,
        borderRadius: 12,
        background: '#f1f5f9',
        border: 'none',
        fontWeight: 700,
        fontSize: 14,
        paddingInline: 24,
        color: '#94a3b8',
        cursor: 'default',
      };
    }
    return {
      height: 40,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
      border: 'none',
      fontWeight: 700,
      fontSize: 14,
      paddingInline: 24,
      boxShadow: '0 4px 12px rgba(22,163,74,0.15)',
    };
  };

  return (
    <Card
      hoverable
      onClick={() => router.push(`/jobs/${job.id}`)}
      style={{
        borderRadius: 20,
        border: '1px solid rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: '24px' } }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Main Info Section */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Company Logo container */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              color: '#16a34a',
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              flexShrink: 0,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)',
            }}
          >
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName || 'Company'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML =
                    job.companyName?.charAt(0).toUpperCase() || job.title.charAt(0).toUpperCase();
                }}
              />
            ) : (
              job.companyName?.charAt(0).toUpperCase() || job.title.charAt(0).toUpperCase()
            )}
          </div>

          {/* Job Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: 6,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {job.title}
            </h3>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 12 }}>
              {job.companyName || 'Công ty tuyển dụng'}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <EnvironmentOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600 }}>
                <DollarOutlined style={{ fontSize: 16 }} />
                {job.salaryMin} - {job.salaryMax}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ExperimentOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                {formatExperience(job.experienceYearsMin, job.experience)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                {getTimeAgo(job.createdAt)}
              </span>
            </div>
          </div>

          {/* Save Action */}
          {onSaveToggle && (
            <Button
              type="text"
              shape="circle"
              icon={isSaved ? <HeartFilled style={{ color: '#ef4444', fontSize: 20 }} /> : <HeartOutlined style={{ color: '#94a3b8', fontSize: 20 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onSaveToggle(job.id);
              }}
              style={{
                background: isSaved ? 'rgba(239,68,68,0.05)' : 'transparent',
                transition: 'all 0.2s',
              }}
            />
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag style={{
              borderRadius: 100,
              padding: '4px 16px',
              border: 'none',
              background: 'rgba(22,163,74,0.08)',
              color: '#16a34a',
              fontWeight: 700,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <ThunderboltOutlined /> {jobTypeMap[job.jobType]}
            </Tag>
          </div>
          
          <Button
            type="primary"
            style={getApplyButtonStyle()}
          >
            {getApplyButtonText()}
          </Button>
        </div>
      </div>
    </Card>
  );
}
