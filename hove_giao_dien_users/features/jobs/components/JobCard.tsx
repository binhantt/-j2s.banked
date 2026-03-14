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
      style={{ borderRadius: 16, border: '1px solid #e5e7eb' }}
      styles={{ body: { padding: 20 } }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Company Logo */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: job.companyLogoUrl
              ? 'transparent'
              : 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
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
                  'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)';
                e.currentTarget.parentElement!.innerHTML =
                  job.companyName?.charAt(0) || job.title.charAt(0);
              }}
            />
          ) : (
            job.companyName?.charAt(0) || job.title.charAt(0)
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {job.title}
          </button>
          <div className="text-sm text-gray-500">{job.companyName || 'Công ty tuyển dụng'}</div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <EnvironmentOutlined /> {job.location}
            </span>
            <span className="flex items-center gap-1 text-orange-500">
              <DollarOutlined /> {job.salaryMin} - {job.salaryMax}
            </span>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined /> {getTimeAgo(job.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2">
          <Tag color="orange" className="rounded-full px-3 py-1">
            {jobTypeMap[job.jobType]}
          </Tag>
          <Button
            type="primary"
            className="!bg-orange-500"
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            Ứng tuyển
          </Button>
          {onSaveToggle && (
            <Button
              type="default"
              shape="circle"
              icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
              onClick={() => onSaveToggle(job.id)}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
