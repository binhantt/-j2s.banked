import { Space, Skeleton, Typography } from 'antd';
import { useCompanyBasicInfoByHrId } from '@/hooks/useCompanyWithDomain';
import { CompanyInfo } from './CompanyInfo';

const { Text } = Typography;

interface JobCompanyBadgeProps {
  hrId: number;
  fallbackName?: string;
}

export const JobCompanyBadge = ({ hrId, fallbackName }: JobCompanyBadgeProps) => {
  const { company, loading, error } = useCompanyBasicInfoByHrId(hrId);

  if (loading) {
    return (
      <Space>
        <Skeleton.Avatar size="small" />
        <Skeleton.Input style={{ width: 120, height: 16 }} active />
      </Space>
    );
  }

  if (error || !company) {
    return (
      <Space>
        <div 
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666'
          }}
        >
          {fallbackName?.charAt(0) || '?'}
        </div>
        <Text style={{ fontSize: '14px', color: '#666' }}>
          {fallbackName || 'Không rõ công ty'}
        </Text>
      </Space>
    );
  }

  return <CompanyInfo company={company} size="small" />;
};