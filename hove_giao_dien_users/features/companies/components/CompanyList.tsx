import { useEffect, useState } from 'react';
import { Row, Col, Spin, Card, Empty } from 'antd';
import {
  SortAscendingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useCompanyStore } from '../store/useCompanyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { CompanyCard } from './CompanyCard';

export const CompanyList = () => {
  const { companies, loading, filters, fetchCompanies } = useCompanyStore();
  const { user, isAuthenticated } = useAuthStore();
  const [savedCompanyIds, setSavedCompanyIds] = useState<number[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchCompanies();
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadSavedCompanies();
    }
  }, [isAuthenticated, user?.id]);

  const loadSavedCompanies = async () => {
    if (!user?.id) return;
    try {
      const saved = await savedCompanyApi.getUserSavedCompanies(user.id);
      setSavedCompanyIds(saved.map((s: any) => s.companyId));
    } catch (error) {
      console.error('Load saved companies error:', error);
    }
  };

  const handleSaveToggle = async (companyId: number) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      if (savedCompanyIds.includes(companyId)) {
        await savedCompanyApi.unsaveCompany(user.id, companyId);
        setSavedCompanyIds(savedCompanyIds.filter(id => id !== companyId));
      } else {
        await savedCompanyApi.saveCompany(user.id, companyId);
        setSavedCompanyIds([...savedCompanyIds, companyId]);
      }
    } catch (error) {
      console.error('Save toggle error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          paddingBottom: 20,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 4,
              letterSpacing: '-0.02em',
            }}
          >
            Doanh nghiệp nổi bật
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, margin: 0 }}>
            Tìm thấy <span style={{ color: '#16a34a', fontWeight: 700 }}>{companies.length}</span> công ty đang tuyển dụng
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            color: '#64748b',
            background: '#fff',
            padding: '8px 16px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <SortAscendingOutlined style={{ color: '#16a34a' }} />
          Sắp xếp:{' '}
          <span style={{ color: '#16a34a' }}>
            Phù hợp nhất
          </span>
        </div>
      </div>

      {/* Grid */}
      {companies.length === 0 ? (
        <Card
          style={{
            textAlign: 'center',
            padding: '100px 40px',
            borderRadius: 24,
            border: '1px dashed #e2e8f0',
            background: 'rgba(255,255,255,0.5)',
          }}
          styles={{ body: { padding: 0 } }}
        >
          <AppstoreOutlined
            style={{ fontSize: 64, color: '#cbd5e1', marginBottom: 24 }}
          />
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 12,
            }}
          >
            Chưa tìm thấy công ty phù hợp
          </h3>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 400, margin: '0 auto' }}>
            Chúng tôi không tìm thấy kết quả nào khớp với tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
          </p>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {companies.map((company) => (
            <Col key={company.id} xs={24} sm={12} lg={8}>
              <CompanyCard
                company={company}
                isSaved={savedCompanyIds.includes(company.id)}
                onSaveToggle={handleSaveToggle}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
