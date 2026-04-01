import { useEffect, useState } from 'react';
import { Input, Button, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
    <div style={{ background: '#f8fafc' }}>
      {/* Premium Hero Search Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1220 0%, #166534 100%)',
          padding: '80px 24px 100px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 40,
        }}
      >
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '50%', height: '100%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Tag color="success" style={{ borderRadius: 100, padding: '4px 16px', marginBottom: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Top Employers 2024
            </Tag>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                color: '#fff',
                marginBottom: 20,
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              Khám phá các <span style={{ color: '#4ade80' }}>Doanh nghiệp</span> hàng đầu
            </h1>
            <p
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.7)',
                maxWidth: 700,
                margin: '0 auto 48px',
                lineHeight: 1.6
              }}
            >
              Tìm kiếm môi trường làm việc lý tưởng và cơ hội bứt phá nghề nghiệp từ hàng nghìn công ty uy tín nhất Việt Nam.
            </p>
          </div>

          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.05)',
            padding: 10,
            borderRadius: 24,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 12
          }}>
            <Input
              size="large"
              placeholder="Tìm tên công ty, lĩnh vực kinh doanh..."
              prefix={<SearchOutlined style={{ color: '#4ade80', fontSize: 20 }} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                borderRadius: 16,
                fontSize: 16,
                flex: 1,
                height: 60,
                border: 'none',
                background: '#fff'
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleSearch}
              style={{
                borderRadius: 16,
                height: 60,
                background: '#16a34a',
                borderColor: 'transparent',
                fontWeight: 800,
                fontSize: 16,
                padding: '0 40px',
                boxShadow: '0 10px 20px rgba(22, 163, 74, 0.3)',
              }}
            >
              TÌM KIẾM
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Industry Filter Section */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 32,
            padding: '32px 40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 4, height: 20, background: '#16a34a', borderRadius: 4 }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Lọc theo lĩnh vực
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Tag
              key="all-domains"
              onClick={() => handleIndustryClick(undefined)}
              style={{
                cursor: 'pointer',
                padding: '10px 24px',
                fontSize: 14,
                borderRadius: 100,
                transition: 'all 0.3s ease',
                border: !filters.domainId ? 'none' : '1px solid #e2e8f0',
                background: !filters.domainId ? '#16a34a' : '#f8fafc',
                color: !filters.domainId ? '#fff' : '#64748b',
                fontWeight: 700,
                margin: 0,
                boxShadow: !filters.domainId ? '0 10px 20px rgba(22,163,74,0.2)' : 'none'
              }}
            >
              Tất cả ngành nghề
            </Tag>
            {domains.map((domain) => (
              <Tag
                key={domain.id}
                onClick={() => handleIndustryClick(domain.id)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 24px',
                  fontSize: 14,
                  borderRadius: 100,
                  transition: 'all 0.3s ease',
                  border: filters.domainId === domain.id ? 'none' : '1px solid #e2e8f0',
                  background: filters.domainId === domain.id ? '#16a34a' : '#fff',
                  color: filters.domainId === domain.id ? '#fff' : '#475569',
                  fontWeight: 700,
                  margin: 0,
                  boxShadow: filters.domainId === domain.id ? '0 10px 20px rgba(22,163,74,0.2)' : 'none'
                }}
              >
                {domain.name}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

