import { useState, useEffect } from 'react';
import { Tag, Spin } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { domainApi, Domain } from '@/lib/domainApi';

interface DomainDisplayProps {
  domainId?: number;
  showIcon?: boolean;
  size?: 'small' | 'default' | 'large';
}

export const DomainDisplay = ({ domainId, showIcon = true, size = 'default' }: DomainDisplayProps) => {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (domainId) {
      loadDomain();
    }
  }, [domainId]);

  const loadDomain = async () => {
    if (!domainId) return;
    
    setLoading(true);
    try {
      const domainData = await domainApi.getDomainById(domainId);
      setDomain(domainData);
    } catch (error) {
      console.error('Error loading domain:', error);
      setDomain(null);
    } finally {
      setLoading(false);
    }
  };

  if (!domainId) {
    return null;
  }

  if (loading) {
    return <Spin size="small" />;
  }

  if (!domain) {
    return (
      <Tag color="default" icon={showIcon ? <TagsOutlined /> : undefined}>
        Không xác định
      </Tag>
    );
  }

  return (
    <Tag 
      color="blue" 
      icon={showIcon ? <TagsOutlined /> : undefined}
      title={domain.description}
    >
      {domain.name}
    </Tag>
  );
};