import { useEffect, useState } from 'react';
import { Input, Button, Tag } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useCompanyStore } from '../store/useCompanyStore';
import { domainApi, Domain } from '@/lib/domainApi';

export const CompanySearch = () => {
  const { filters, setFilters } = useCompanyStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [domains, setDomains] = useState<Domain[]>([]);

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
    setFilters({ ...filters, domainId });
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero Section — Premium Light Header */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '60px 48px 64px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Background Decorative Shapes */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '5%',
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(22,163,74,0.04) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.06)',
            color: '#16a34a',
            padding: '6px 16px', borderRadius: 100,
            fontSize: 13, fontWeight: 700,
            marginBottom: 20, border: '1px solid rgba(22,163,74,0.08)',
          }}>
            🏢 Mạng lưới doanh nghiệp uy tín
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 40, fontWeight: 800,
            color: '#0f172a', lineHeight: 1.2, marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            Nơi kết nối các{' '}
            <span style={{ color: '#16a34a' }}>Sự nghiệp hàng đầu</span>
          </h1>

          <p style={{
            fontSize: 16, color: '#64748b',
            marginBottom: 36, maxWidth: 620,
            lineHeight: 1.6,
          }}>
            Khám phá mạng lưới hàng ngàn doanh nghiệp hàng đầu. Hãy tìm môi trường làm việc lý tưởng để bứt phá tiềm năng của bạn.
          </p>

          {/* Search Bar Container */}
          <div style={{ 
            display: 'flex', gap: 12, maxWidth: 640, 
            background: '#fff', padding: 8, borderRadius: 18,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)'
          }}>
            <Input
              variant="borderless"
              placeholder="Nhập tên công ty hoặc ngành nghề..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                flex: 1, paddingLeft: 16,
                fontSize: 16, fontWeight: 500,
                color: '#1e293b',
              }}
              prefix={<SearchOutlined style={{ color: '#16a34a', fontSize: 18, marginRight: 8 }} />}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleSearch}
              style={{
                height: 50, borderRadius: 12,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                paddingInline: 32,
                boxShadow: '0 6px 16px rgba(22,163,74,0.15)',
              }}
            >
              Tìm ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Filter Category Bar */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 20,
          padding: '24px 30px',
          marginBottom: 40,
          border: '1px solid rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 16,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(22,163,74,0.1)', display: 'grid', placeItems: 'center'
          }}>
            <FilterOutlined style={{ color: '#16a34a', fontSize: 14 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            Lọc theo lĩnh vực hoạt động
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Tag
            onClick={() => handleIndustryClick(undefined)}
            style={{
              cursor: 'pointer',
              borderRadius: 12,
              border: !filters.domainId ? 'none' : '1px solid #e2e8f0',
              background: !filters.domainId ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#fff',
              color: !filters.domainId ? '#fff' : '#475569',
              fontWeight: 700,
              fontSize: 14,
              padding: '6px 20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: !filters.domainId ? '0 4px 12px rgba(22,163,74,0.15)' : 'none',
              margin: 0,
            }}
          >
            🔥 Tất cả ngành
          </Tag>
          {domains.map((domain) => (
            <Tag
              key={domain.id}
              onClick={() => handleIndustryClick(domain.id)}
              style={{
                cursor: 'pointer',
                borderRadius: 12,
                border: filters.domainId === domain.id ? 'none' : '1px solid #e2e8f0',
                background: filters.domainId === domain.id ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#fff',
                color: filters.domainId === domain.id ? '#fff' : '#475569',
                fontWeight: 700,
                fontSize: 14,
                padding: '6px 20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: filters.domainId === domain.id ? '0 4px 12px rgba(22,163,74,0.15)' : 'none',
                margin: 0,
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
