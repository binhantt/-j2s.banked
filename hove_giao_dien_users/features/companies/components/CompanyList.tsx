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
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#111827',
              marginBottom: 2,
            }}
          >
            Công ty nổi bật
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Tìm thấy {companies.length} công ty phù hợp
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: '#6b7280',
          }}
        >
          <SortAscendingOutlined style={{ color: '#16a34a' }} />
          Sắp xếp:{' '}
          <span style={{ color: '#16a34a', fontWeight: 600 }}>
            Nổi bật nhất
          </span>
        </div>
      </div>

      {/* Grid */}
      {companies.length === 0 ? (
        <Card
          style={{
            textAlign: 'center',
            padding: 60,
            borderRadius: 16,
            border: '1px solid #e5e7eb',
          }}
          styles={{ body: { padding: 60 } }}
        >
          <AppstoreOutlined
            style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }}
          />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#111827',
              marginBottom: 8,
            }}
          >
            Không tìm thấy công ty phù hợp
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.
          </p>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
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
