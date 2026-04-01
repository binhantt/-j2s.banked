import { Card, Button, Avatar, Tag } from 'antd';
import {
  EnvironmentOutlined,
  TeamOutlined,
  HeartOutlined,
  HeartFilled,
  RightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { Company } from '../api/companyApi';
import { DomainDisplay } from '@/components/DomainDisplay';

interface CompanyCardProps {
  company: Company;
  isSaved?: boolean;
  onSaveToggle?: (companyId: number) => void;
}

export const CompanyCard = ({ company, isSaved = false, onSaveToggle }: CompanyCardProps) => {
  const router = useRouter();

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveToggle) {
      onSaveToggle(company.id);
    }
  };

  return (
    <Card
      hoverable
      onClick={() => router.push(`/companies/${company.id}`)}
      style={{
        borderRadius: 32,
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        boxShadow: '0 4px 20px rgba(15,23,42,0.02)',
        cursor: 'pointer',
        height: '100%',
        background: '#fff',
        position: 'relative'
      }}
      styles={{ body: { padding: 0 } }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 30px 60px rgba(15,23,42,0.1)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px)';
        (e.currentTarget as HTMLElement).style.borderColor = '#dcfce7';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(15,23,42,0.02)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
      }}
    >
      {/* Premium Banner */}
      <div
        style={{
          height: 140,
          position: 'relative',
          background: 'linear-gradient(135deg, #0b1220 0%, #166534 100%)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 100, height: 100,
          background: 'rgba(74,222,128,0.1)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />
      </div>

      {/* Content Container */}
      <div style={{ padding: '0 28px 32px', position: 'relative' }}>
        {/* Overlapping Logo */}
        <div style={{ marginTop: -50, marginBottom: 20 }}>
          <Avatar
            src={company.logoUrl}
            size={100}
            shape="square"
            style={{
              borderRadius: 24,
              border: '6px solid #fff',
              boxShadow: '0 15px 35px rgba(15,23,42,0.12)',
              background: '#fff',
              fontSize: 40,
              fontWeight: 900,
              color: '#16a34a',
            }}
          >
            {company.name?.charAt(0).toUpperCase()}
          </Avatar>
        </div>

        {/* Company Info */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: 8,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {company.name}
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {company.domainId && <DomainDisplay domainId={company.domainId} size="small" />}
            <Tag color="#f0fdf4" style={{ color: '#16a34a', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, margin: 0 }}>
              VERIFIED
            </Tag>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#64748b', fontSize: 14 }}>
              <EnvironmentOutlined style={{ color: '#16a34a', marginTop: 4 }} />
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                {company.address || 'Hồ Chí Minh, Việt Nam'}
              </span>
            </div>
            {company.companySize && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 14 }}>
                <TeamOutlined style={{ color: '#16a34a' }} />
                <span>Quy mô: <strong>{company.companySize}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12 }}>
          <Button
            type="primary"
            block
            style={{
              height: 52,
              borderRadius: 16,
              background: '#16a34a',
              border: 'none',
              fontWeight: 800,
              fontSize: 14,
              boxShadow: '0 8px 20px rgba(22,163,74,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            KHÁM PHÁ NGAY <RightOutlined style={{ fontSize: 12 }} />
          </Button>
          <Button
            icon={isSaved ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
            onClick={handleSaveToggle}
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              color: '#64748b'
            }}
          />
        </div>
      </div>
    </Card>
  );
};
