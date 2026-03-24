import { Card, Row, Col, Statistic, Progress } from 'antd';
import { 
  TagsOutlined, 
  CheckCircleOutlined, 
  PauseCircleOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import type { DomainSummary } from '../types/domainTypes';

interface DomainStatsProps {
  domains: DomainSummary[];
}

export function DomainStats({ domains }: DomainStatsProps) {
  const totalDomains = domains.length;
  const activeDomains = domains.filter(d => d.isActive).length;
  const inactiveDomains = totalDomains - activeDomains;
  const totalJobs = domains.reduce((sum, d) => sum + d.jobCount, 0);
  const activeRate = totalDomains > 0 ? (activeDomains / totalDomains) * 100 : 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Tổng lĩnh vực"
            value={totalDomains}
            prefix={<TagsOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Đang hoạt động"
            value={activeDomains}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Tạm dừng"
            value={inactiveDomains}
            prefix={<PauseCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Tổng việc làm"
            value={totalJobs}
            prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Tỷ lệ lĩnh vực hoạt động">
          <Progress
            percent={Math.round(activeRate)}
            status={activeRate >= 80 ? 'success' : activeRate >= 60 ? 'normal' : 'exception'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            format={(percent) => `${percent}% (${activeDomains}/${totalDomains})`}
          />
        </Card>
      </Col>
    </Row>
  );
}