import { Card, Skeleton, Alert } from 'antd';
import { useCompanyWithDomainByHrId } from '@/hooks/useCompanyWithDomain';
import { CompanyInfo } from './CompanyInfo';

interface JobCompanyInfoProps {
  hrId: number;
  title?: string;
}

export const JobCompanyInfo = ({ hrId, title = "Thông tin công ty" }: JobCompanyInfoProps) => {
  const { company, loading, error } = useCompanyWithDomainByHrId(hrId);

  if (loading) {
    return (
      <Card title={title} size="small">
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title} size="small">
        <Alert message="Không thể tải thông tin công ty" type="warning" showIcon />
      </Card>
    );
  }

  if (!company) {
    return (
      <Card title={title} size="small">
        <Alert message="Không tìm thấy thông tin công ty" type="info" showIcon />
      </Card>
    );
  }

  return (
    <Card title={title} size="small">
      <CompanyInfo 
        company={company} 
        size="default" 
        showDescription={true}
      />
    </Card>
  );
};