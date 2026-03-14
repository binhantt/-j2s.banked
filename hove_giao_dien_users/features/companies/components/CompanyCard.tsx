import { Card, Tag, Button } from 'antd';
import {
  EnvironmentOutlined,
  TeamOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Company } from '../api/companyApi';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <Card
      hoverable
      onClick={() => router.push(`/companies/${company.id}`)}
      style={{
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      styles={{ body: { padding: 24 } }}
      className="hover:shadow-lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header with Logo and Save Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: company.logoUrl
                ? '#fff'
                : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: '#fff',
              overflow: 'hidden',
              border: '2px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.background =
                    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)';
                  e.currentTarget.parentElement!.innerHTML = company.name.charAt(0);
                }}
              />
            ) : (
              company.name.charAt(0)
            )}
          </div>
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={isSaved ? <HeartFilled style={{ color: '#ff6b35', fontSize: 20 }} /> : <HeartOutlined style={{ fontSize: 20, color: '#9ca3af' }} />}
            onClick={handleSaveToggle}
            style={{ marginTop: -4 }}
          />
        </div>

        {/* Company Name */}
        <h3 style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          color: '#111827', 
          marginBottom: 12,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {company.name}
        </h3>

        {/* Industry Tag */}
        {company.industry && (
          <Tag
            style={{
              marginBottom: 16,
              borderRadius: 6,
              padding: '4px 14px',
              width: 'fit-content',
              border: 'none',
              background: '#cffafe',
              color: '#0e7490',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {company.industry}
          </Tag>
        )}

        {/* Company Info */}
        <div style={{ marginBottom: 16, flex: 1 }}>
          {company.address && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <EnvironmentOutlined style={{ fontSize: 16, color: '#6b7280', marginRight: 8 }} />
              <span style={{ 
                fontSize: 14, 
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {company.address}
              </span>
            </div>
          )}
          {company.companySize && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ fontSize: 16, color: '#6b7280', marginRight: 8 }} />
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                {company.companySize} nhân viên
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <p style={{ 
            fontSize: 14, 
            color: '#6b7280', 
            marginBottom: 20,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {company.description}
          </p>
        )}

        {/* View Details Button */}
        <Button
          type="primary"
          block
          size="large"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/companies/${company.id}`);
          }}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            borderColor: 'transparent',
            height: 44,
            fontSize: 15,
          }}
          className="hover:opacity-90"
        >
          Xem chi tiết
        </Button>
      </div>
    </Card>
  );
};
