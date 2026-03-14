import { useEffect } from 'react';
import { Row, Col, Spin } from 'antd';
import { useCompanyStore } from '../store/useCompanyStore';
import { CompanyCard } from './CompanyCard';

export const CompanyList = () => {
  const { companies, loading, filters, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchCompanies();
    }
  }, [filters]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div 
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 60,
          textAlign: 'center',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏢</div>
        <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 600, color: '#111827' }}>
          Không tìm thấy công ty phù hợp
        </h3>
        <p style={{ color: '#6b7280' }}>
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
          Công ty nổi bật
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Tìm thấy {companies.length} công ty phù hợp
        </p>
      </div>

      <Row gutter={[20, 20]}>
        {companies.map((company) => (
          <Col key={company.id} xs={24} sm={12} lg={8}>
            <CompanyCard company={company} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
