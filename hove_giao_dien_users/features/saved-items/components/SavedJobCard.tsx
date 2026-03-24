import { Avatar, Button, Tag } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface SavedJobCardProps {
  job: any;
  savedAt: string;
  onView: () => void;
  onUnsave: () => void;
}

export const SavedJobCard = ({ job, savedAt, onView, onUnsave }: SavedJobCardProps) => {
  const formatSalary = (j: any) => {
    if (j.salary) return j.salary;
    if (j.salaryMin && j.salaryMax) {
      return `${j.salaryMin.toLocaleString()} - ${j.salaryMax.toLocaleString()} VND`;
    }
    if (j.salaryMin) return `Từ ${j.salaryMin.toLocaleString()} VND`;
    if (j.salaryMax) return `Đến ${j.salaryMax.toLocaleString()} VND`;
    return 'Thỏa thuận';
  };
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 transform hover:-translate-y-1.5 p-6 sm:p-7 relative group flex flex-col h-full cursor-pointer" onClick={onView}>
      
      {/* Absolute Heart Icon for Quick Unsave */}
      <Button 
        type="text" 
        danger 
        shape="circle" 
        icon={<HeartFilled className="text-rose-500 text-lg group-hover:scale-110 transition-transform" />} 
        onClick={(e) => { e.stopPropagation(); onUnsave(); }}
        className="absolute top-4 right-4 hover:bg-rose-50 opacity-opacity-80 hover:opacity-100 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-gray-100" 
      />

      <div className="flex items-start gap-5 pr-12">
        <Avatar
          size={72}
          shape="square"
          src={job.companyLogoUrl}
          className="shadow-sm transition-transform duration-500 group-hover:scale-105 shrink-0"
          style={{
            borderRadius: 18,
            border: '1px solid #f3f4f6',
            background: job.companyLogoUrl ? '#fff' : 'linear-gradient(135deg, #16a34a 0%, #8b5cf6 100%)',
            color: '#fff',
            fontSize: '28px',
            fontWeight: 800,
          }}
        >
          {!job.companyLogoUrl && (job.companyName?.charAt(0) || 'C')}
        </Avatar>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="text-xl font-bold text-gray-900 text-left group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
            {job.title}
          </h3>
          <div className="text-sm font-medium text-gray-500 mt-2 line-clamp-1">{job.companyName || 'Công ty tuyển dụng'}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.jobType && <Tag className="rounded-full px-3 py-1 border-0 bg-green-50 text-green-600 font-semibold text-xs tracking-wide">{job.jobType}</Tag>}
        {(job.experienceLevel || job.experience) && <Tag className="rounded-full px-3 py-1 border-0 bg-green-50 text-green-600 font-semibold text-xs tracking-wide">{job.experienceLevel || job.experience}</Tag>}
      </div>

      <div className="mt-6 flex flex-col gap-3.5 text-sm text-gray-600 flex-grow">
        <span className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <DollarOutlined className="text-emerald-500 text-base" />
          </div>
          <span className="font-bold text-gray-800 text-base">{formatSalary(job)}</span>
        </span>
        <span className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
            <EnvironmentOutlined className="text-gray-400 text-base" />
          </div>
          <span className="line-clamp-1 text-gray-600 font-medium">{job.location || 'Đang cập nhật'}</span>
        </span>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
          <ClockCircleOutlined /> 
          Lưu ngày: {dayjs(savedAt).format('DD/MM/YYYY')}
        </div>
        <div className="flex gap-3">
          <Button 
            type="primary" 
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="bg-green-600 hover:bg-green-500 shadow-md shadow-green-200 font-semibold rounded-xl px-6 h-10"
          >
            Ứng tuyển
          </Button>
        </div>
      </div>
    </div>
  );
};
