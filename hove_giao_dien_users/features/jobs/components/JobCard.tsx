import { Card, Tag, Button, Avatar } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { Job } from '@/store/useJobStore';

interface JobCardProps {
  job: Job;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString('vi-VN');
};

export const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card
        className="h-full border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer bg-white overflow-hidden group"
        bodyStyle={{ padding: '24px' }}
      >
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            src={job.companyLogoUrl}
            size={60}
            shape="square"
            className="border border-gray-200 flex-shrink-0"
          >
            {!job.companyLogoUrl && (job.companyName?.charAt(0) || 'C')}
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {job.title}
            </h3>
            <p className="text-base text-gray-700 font-medium mb-2">
              {job.companyName || 'Công ty tuyển dụng'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Tag color="blue" className="m-0 px-3 py-1">
                {job.jobType}
              </Tag>
              <Tag color="purple" className="m-0 px-3 py-1">
                {job.level}
              </Tag>
            </div>
          </div>
          <Button
            type="text"
            icon={<HeartOutlined className="text-xl" />}
            className="text-gray-400 hover:text-red-500 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
            }}
          />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <EnvironmentOutlined className="mr-2 text-indigo-600 text-lg" />
            <span className="font-medium">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarOutlined className="mr-2 text-green-600 text-lg" />
            <span className="font-semibold text-green-600">
              {job.salaryMin} - {job.salaryMax}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <ClockCircleOutlined className="mr-2" />
            <span>Đăng {formatDate(job.createdAt)}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            type="primary"
            block
            size="large"
            className="rounded-xl font-medium"
          >
            Ứng tuyển ngay
          </Button>
        </div>
      </Card>
    </Link>
  );
};
