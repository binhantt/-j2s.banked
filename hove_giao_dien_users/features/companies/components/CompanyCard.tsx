import { Card, Button, Avatar } from 'antd';
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
        borderRadius: 24,
        border: '1px solid rgba(0,0,0,0.04)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        height: '100%',
        background: '#fff',
      }}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 15px 45px rgba(0,0,0,0.08)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Cover Banner */}
      <div
        style={{
          height: 120,
          position: 'relative',
          background: company.logoUrl
            ? 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
            : 'linear-gradient(135deg, #16a34a, #22c55e)',
          overflow: 'hidden',
        }}
      >
        {/* Soft pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Blurred logo as background texture */}
        {company.logoUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${company.logoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(4px)',
              opacity: 0.15,
            }}
          />
        )}

        {/* Save button */}
        <Button
          type="text"
          shape="circle"
          icon={
            isSaved ? (
              <HeartFilled style={{ fontSize: 18, color: '#ef4444' }} />
            ) : (
              <HeartOutlined style={{ fontSize: 18, color: company.logoUrl ? '#94a3b8' : '#fff' }} />
            )
          }
          onClick={handleSaveToggle}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        />
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '0 24px 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo — overlaps the banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 16 }}>
          <Avatar
            src={company.logoUrl}
            size={80}
            style={{
              border: '4px solid #fff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              background: '#fff',
              fontSize: 32,
              fontWeight: 800,
              color: '#16a34a',
            }}
          >
            {company.name?.charAt(0).toUpperCase()}
          </Avatar>
        </div>

        {/* Company Name */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 8,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {company.name}
        </h3>

        {/* Domain tag */}
        {company.domainId && (
          <div style={{ marginBottom: 16 }}>
            <DomainDisplay domainId={company.domainId} size="small" />
          </div>
        )}

        {/* Meta info */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {company.address && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 14,
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <EnvironmentOutlined
                style={{ color: '#16a34a', marginTop: 3, flexShrink: 0 }}
              />
              <span
                style={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.5,
                }}
              >
                {company.address}
              </span>
            </div>
          )}

          {company.companySize && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <TeamOutlined style={{ color: '#16a34a' }} />
              <span>{company.companySize} nhân viên</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/companies/${company.id}`);
          }}
          style={{
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            border: 'none',
            fontWeight: 700,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 16px rgba(22,163,74,0.15)',
          }}
          icon={<RightOutlined style={{ fontSize: 13 }} />}
        >
          Chi tiết doanh nghiệp
        </Button>
      </div>
    </Card>
  );
};
