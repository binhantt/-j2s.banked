import { useState } from 'react';
import { Input, Button, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useCompanyStore } from '../store/useCompanyStore';

const INDUSTRIES = [
  { label: 'Tất cả ngành', value: '' },
  { label: 'IT/Software', value: 'IT' },
  { label: 'Tài chính', value: 'Finance' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Giáo dục', value: 'Education' },
];

const COMPANY_SIZES = [
  { label: '1-50', value: '1-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '500+', value: '500+' },
];

export const CompanySearch = () => {
  const { filters, setFilters } = useCompanyStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput });
  };

  const handleIndustryClick = (industry: string) => {
    setFilters({ ...filters, industry: industry || undefined });
  };

  const handleSizeClick = (size: string) => {
    setFilters({ ...filters, companySize: size });
  };

  return (
    <div>
      {/* Hero Search Section */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '48px 24px',
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Khám phá các công ty hàng đầu
          </h1>
          <p 
            style={{
              fontSize: 16,
              color: '#cbd5e1',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Tìm kiếm môi trường làm việc và cơ hội nghề nghiệp phù hợp với bạn nhất với hàng ngàn công ty hàng đầu
          </p>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <Input
              size="large"
              placeholder="Tìm tên công ty, lĩ vực, ngành nghề..."
              prefix={<SearchOutlined style={{ color: '#94a3b8', fontSize: 18 }} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                borderRadius: 8,
                fontSize: 15,
                flex: 1,
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleSearch}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                borderColor: 'transparent',
                fontWeight: 600,
                padding: '0 32px',
              }}
              className="hover:opacity-90"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div 
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #e5e7eb',
          marginBottom: 24,
        }}
      >
        {/* Industry Tags */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            NGÀNH NGHỀ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INDUSTRIES.map((industry) => (
              <Tag
                key={industry.value}
                onClick={() => handleIndustryClick(industry.value)}
                style={{
                  cursor: 'pointer',
                  padding: '6px 16px',
                  fontSize: 13,
                  borderRadius: 20,
                  border: filters.industry === industry.value ? '2px solid #06b6d4' : '1px solid #e5e7eb',
                  background: filters.industry === industry.value ? '#cffafe' : '#fff',
                  color: filters.industry === industry.value ? '#0e7490' : '#64748b',
                  fontWeight: filters.industry === industry.value ? 600 : 400,
                }}
              >
                {industry.label}
              </Tag>
            ))}
          </div>
        </div>

        {/* Company Size Tags */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            QUY MÔ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COMPANY_SIZES.map((size) => (
              <Tag
                key={size.value}
                onClick={() => handleSizeClick(size.value)}
                style={{
                  cursor: 'pointer',
                  padding: '6px 16px',
                  fontSize: 13,
                  borderRadius: 20,
                  border: filters.companySize === size.value ? '2px solid #06b6d4' : '1px solid #e5e7eb',
                  background: filters.companySize === size.value ? '#cffafe' : '#fff',
                  color: filters.companySize === size.value ? '#0e7490' : '#64748b',
                  fontWeight: filters.companySize === size.value ? 600 : 400,
                }}
              >
                {size.label}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
