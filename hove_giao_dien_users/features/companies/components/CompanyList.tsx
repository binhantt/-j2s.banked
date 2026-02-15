import { useEffect, useState } from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import { useCompanyStore } from '@/store/useCompanyStore';
import { CompanyCard } from './CompanyCard';
import { companyApi } from '@/lib/companyApi';

export const CompanyList = () => {
  const { filteredCompanies, setCompanies } = useCompanyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await companyApi.getAllCompanies();
      // Transform API data to match store format
      const companies = data.map((company: any) => ({
        id: company.id?.toString() || '',
        name: company.name || 'Chưa cập nhật',
        logo: company.logoUrl || 'https://via.placeholder.com/100',
        industry: company.industry || 'Chưa cập nhật',
        location: company.address || 'Chưa cập nhật',
        size: company.companySize || 'Chưa cập nhật',
        description: company.description || 'Chưa có mô tả',
        openJobs: 0, // TODO: Count from jobs API
        rating: 4.5,
        benefits: company.benefits ? company.benefits.split('\n').slice(0, 3) : [],
      }));
      setCompanies(companies);
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (filteredCompanies.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Empty description="Không tìm thấy công ty" />
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {filteredCompanies.map((company) => (
        <Col key={company.id} xs={24} sm={12} lg={8}>
          <CompanyCard company={company} />
        </Col>
      ))}
    </Row>
  );
};
