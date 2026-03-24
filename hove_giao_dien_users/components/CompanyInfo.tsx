import { Avatar, Tag, Space } from 'antd';
import { CompanyWithDomain, CompanyBasicInfo } from '@/lib/companyApi';

interface CompanyInfoProps {
  company: CompanyWithDomain | CompanyBasicInfo;
  size?: 'small' | 'default' | 'large';
  showDescription?: boolean;
}

export const CompanyInfo = ({ company, size = 'default', showDescription = false }: CompanyInfoProps) => {
  const avatarSize = size === 'small' ? 32 : size === 'large' ? 64 : 48;
  const nameSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space align="center">
        <Avatar
          src={company.logoUrl}
          size={avatarSize}
          shape="square"
          style={{
            backgroundColor: '#f0f0f0',
            color: '#666',
            fontSize: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px'
          }}
        >
          {!company.logoUrl && company.name?.charAt(0)}
        </Avatar>
        
        <div>
          <div 
            style={{ 
              fontSize: nameSize, 
              fontWeight: 600, 
              color: '#262626',
              marginBottom: '4px'
            }}
          >
            {company.name}
          </div>
          
          {company.domain && (
            <Tag 
              color="blue" 
              style={{ 
                fontSize: size === 'small' ? '11px' : '12px',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {company.domain.name}
            </Tag>
          )}
        </div>
      </Space>
      
      {showDescription && 'description' in company && company.description && (
        <div 
          style={{ 
            fontSize: '13px', 
            color: '#666', 
            marginTop: '8px',
            lineHeight: 1.4
          }}
        >
          {company.description.length > 100 
            ? `${company.description.substring(0, 100)}...` 
            : company.description
          }
        </div>
      )}
    </Space>
  );
};