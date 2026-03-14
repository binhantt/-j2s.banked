import { Avatar, Button, Space } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
} from '@ant-design/icons';

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

  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      <Avatar 
        size={80} 
        shape="square"
        src={job.companyLogoUrl}
        style={{ 
          background: job.companyLogoUrl ? 'transparent' : '#f0f0f0', 
          color: '#999', 
          fontSize: 32,
          border: '1px solid #e8e8e8',
          flexShrink: 0
        }}
      >
        {!job.companyLogoUrl && (job.companyName?.charAt(0) || job.title.charAt(0))}
      </Avatar>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          {job.title}
        </h1>
        <p style={{ fontSize: 16, color: '#1890ff', marginBottom: 12, fontWeight: 500 }}>
          {job.companyName || 'Acgen'}
        </p>
        <Space size={[16, 8]} wrap>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <span>📍</span>
            <span>Địa điểm: {job.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <span>💰</span>
            <span>Mức lương: {job.salaryMin} - {job.salaryMax}</span>
          </div>
        </Space>
        <Space size={[16, 8]} wrap style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <ClockCircleOutlined />
            <span>Hình thức: {jobTypeMap[job.jobType]} • {levelMap[job.level]}</span>
          </div>
        </Space>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {canApply && (
            <Button 
              type="primary" 
              size="large"
              onClick={onApply}
              disabled={hasApplied || isJobClosed}
              style={{ minWidth: 160 }}
            >
              {hasApplied ? 'Đã ứng tuyển' : isJobClosed ? 'Đã đóng' : 'Ứng tuyển ngay'}
            </Button>
          )}
          <Button 
            size="large" 
            icon={<HeartOutlined />}
            onClick={onSave}
          >
            Lưu tin
          </Button>
        </div>
      </div>
    </div>
  );
};
