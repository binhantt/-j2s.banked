import { Card, Button, Avatar } from 'antd';
import {
  EnvironmentOutlined,
  TeamOutlined,
  HeartOutlined,
  HeartFilled,
  RightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useState } from 'react';
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
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        height: '100%',
      }}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 8px 24px rgba(0,0,0,0.1)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 1px 4px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Cover Banner */}
      <div
        style={{
          height: 100,
          position: 'relative',
          background:
            company.logoUrl
              ? 'linear-gradient(135deg, #16a34a, #22c55e)'
              : 'linear-gradient(135deg, #0b1220, #1e3a5f)',
          overflow: 'hidden',
        }}
      >
        {/* Blurred logo as background texture */}
        {company.logoUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${company.logoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px)',
              opacity: 0.3,
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
              <HeartOutlined style={{ fontSize: 18, color: '#fff' }} />
            )
          }
          onClick={handleSaveToggle}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            border: 'none',
          }}
        />
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '0 18px 18px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo — overlaps the banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -32, marginBottom: 12 }}>
          <Avatar
            src={company.logoUrl}
            size={64}
            style={{
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              background: '#f3f4f6',
              fontSize: 24,
              fontWeight: 700,
              color: '#16a34a',
            }}
          >
            {company.name?.charAt(0)}
          </Avatar>
        </div>

        {/* Company Name */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 6,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {company.name}
        </h3>

        {/* Domain tag */}
        {company.domainId && (
          <div style={{ marginBottom: 10 }}>
            <DomainDisplay domainId={company.domainId} size="small" />
          </div>
        )}

        {/* Meta info */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginBottom: 14,
          }}
        >
          {company.address && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 13,
                color: '#6b7280',
              }}
            >
              <EnvironmentOutlined
                style={{ color: '#9ca3af', marginTop: 2, flexShrink: 0 }}
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
                gap: 8,
                fontSize: 13,
                color: '#6b7280',
              }}
            >
              <TeamOutlined style={{ color: '#9ca3af' }} />
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
            height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          icon={<RightOutlined style={{ fontSize: 12 }} />}
        >
          Xem chi tiết công ty
        </Button>
      </div>
    </Card>
  );
};
