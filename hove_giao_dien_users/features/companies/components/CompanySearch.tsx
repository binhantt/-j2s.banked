import { useEffect, useState } from 'react';
import { Input, Button, Tag } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useCompanyStore } from '../store/useCompanyStore';
import { domainApi, Domain } from '@/lib/domainApi';

export const CompanySearch = () => {
  const { filters, setFilters } = useCompanyStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<number | undefined>(filters.domainId);

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const data = await domainApi.getActiveDomains();
        setDomains(data || []);
      } catch {
        setDomains([]);
      }
    };
    loadDomains();
  }, []);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput });
  };

  const handleIndustryClick = (domainId?: number) => {
    setSelectedDomainId(domainId);
    setFilters({ ...filters, domainId });
  };

  return (
    <div>
      {/* Hero Section — Professional dark header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1220 0%, #1e3a5f 100%)',
          borderRadius: '0 0 24px 24px',
          padding: '48px 40px 56px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: 16, right: 24,
          width: 80, height: 80,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'rgba(22,163,74,0.12)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: 10, right: 60,
          width: 40, height: 40,
          background: 'rgba(22,163,74,0.08)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.15)',
            color: '#4ade80',
            padding: '4px 14px', borderRadius: 100,
            fontSize: 12, fontWeight: 600,
            marginBottom: 16, border: '1px solid rgba(22,163,74,0.25)',
          }}>
            <span>🏢</span> Mạng lưới doanh nghiệp
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 32, fontWeight: 800,
            color: '#f8fafc', lineHeight: 1.2, marginBottom: 12,
          }}>
            Khám phá các{' '}
            <span style={{ color: '#4ade80' }}>công ty hàng đầu</span>
          </h1>

          <p style={{
            fontSize: 15, color: '#94a3b8',
            marginBottom: 28, maxWidth: 560,
          }}>
            Tìm kiếm môi trường làm việc lý tưởng và cơ hội nghề nghiệp phù hợp với bạn từ hàng ngàn doanh nghiệp uy tín.
          </p>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 10, maxWidth: 580 }}>
            <Input
              size="large"
              placeholder="Tìm tên công ty, lĩnh vực hoạt động..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                height: 48, borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 15,
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleSearch}
              style={{
                height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                border: 'none',
                fontWeight: 600,
                fontSize: 15,
                paddingLeft: 24, paddingRight: 24,
              }}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* Industry Filter Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 28,
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 14,
        }}>
          <FilterOutlined style={{ color: '#16a34a', fontSize: 14 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Lọc theo ngành nghề
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Tag
            onClick={() => handleIndustryClick(undefined)}
            style={{
              cursor: 'pointer',
              borderRadius: 100,
              border: selectedDomainId === undefined ? 'none' : '1px solid #e5e7eb',
              background: selectedDomainId === undefined ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#f9fafb',
              color: selectedDomainId === undefined ? '#fff' : '#6b7280',
              fontWeight: selectedDomainId === undefined ? 600 : 500,
              fontSize: 13,
              padding: '4px 14px',
              transition: 'all 0.2s',
            }}
          >
            Tất cả ngành
          </Tag>
          {domains.map((domain) => (
            <Tag
              key={domain.id}
              onClick={() => handleIndustryClick(domain.id)}
              style={{
                cursor: 'pointer',
                borderRadius: 100,
                border: selectedDomainId === domain.id ? 'none' : '1px solid #e5e7eb',
                background: selectedDomainId === domain.id
                  ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                  : '#f9fafb',
                color: selectedDomainId === domain.id ? '#fff' : '#6b7280',
                fontWeight: selectedDomainId === domain.id ? 600 : 500,
                fontSize: 13,
                padding: '4px 14px',
                transition: 'all 0.2s',
              }}
            >
              {domain.name}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};
