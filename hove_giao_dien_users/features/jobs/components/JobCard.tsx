import { Card, Tag, Button } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { Job } from '../api/jobApi';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSaveToggle?: (jobId: number) => void;
}

const jobTypeMap: Record<string, string> = {
  'full-time': 'Toàn thời gian',
  'part-time': 'Bán thời gian',
  'contract': 'Hợp đồng',
  'internship': 'Thực tập',
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const posted = new Date(date);
  const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return '1 ngày trước';
  return `${days} ngày trước`;
};

export default function JobCard({ job, isSaved = false, onSaveToggle }: JobCardProps) {
  const router = useRouter();

  return (
    <Card
      hoverable
      style={{ borderRadius: 14, border: '1px solid #f0fdf4' }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top row: logo + info */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Company Logo */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              overflow: 'hidden',
              border: '1px solid #f0fdf4',
              flexShrink: 0,
            }}
          >
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName || 'Company'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.background =
                    'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)';
                  e.currentTarget.parentElement!.innerHTML =
                    job.companyName?.charAt(0) || job.title.charAt(0);
                }}
              />
            ) : (
              job.companyName?.charAt(0) || job.title.charAt(0)
            )}
          </div>

          {/* Job Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => router.push(`/jobs/${job.id}`)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, textAlign: 'left',
                fontSize: 16,
                fontWeight: 700,
                color: '#0b1220',
                display: 'block',
                width: '100%',
                lineHeight: 1.3,
              }}
            >
              {job.title}
            </button>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {job.companyName || 'Công ty tuyển dụng'}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 13, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ color: '#16a34a' }} />
                {job.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                <DollarOutlined style={{ color: '#f59e0b' }} />
                {job.salaryMin} - {job.salaryMax}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#16a34a' }} />
                {getTimeAgo(job.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: tags + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Tag style={{ borderRadius: 6, border: '1px solid #dcfce7', color: '#16a34a', background: '#f0fdf4' }}>
            {jobTypeMap[job.jobType]}
          </Tag>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onSaveToggle && (
              <Button
                type="default"
                shape="circle"
                icon={isSaved ? <HeartFilled style={{ color: '#16a34a' }} /> : <HeartOutlined style={{ color: '#16a34a' }} />}
                onClick={() => onSaveToggle(job.id)}
                style={{ borderColor: '#16a34a', color: '#16a34a' }}
              />
            )}
            <Button
              type="primary"
              onClick={() => router.push(`/jobs/${job.id}`)}
              style={{
                background: '#16a34a',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
              }}
            >
              Ứng tuyển
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
