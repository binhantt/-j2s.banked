import { Card, Col, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import { TeamOutlined, BankOutlined, SolutionOutlined, FileDoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const overviewData = [
  { key: 'users', title: 'Người dùng', value: 24512, icon: <TeamOutlined />, color: '#16a34a' },
  { key: 'companies', title: 'Nhà tuyển dụng', value: 980, icon: <BankOutlined />, color: '#16a34a' },
  { key: 'jobs', title: 'Tin tuyển dụng', value: 3560, icon: <SolutionOutlined />, color: '#16a34a' },
  { key: 'applications', title: 'Lượt ứng tuyển', value: 18790, icon: <FileDoneOutlined />, color: '#16a34a' },
];

const chartPoints = [35, 42, 40, 55, 52, 68, 64, 74, 70];

const recentJobs = [
  { id: 1, title: 'Frontend React Developer', company: 'FPT Software', status: 'active', date: '22/11/2026' },
  { id: 2, title: 'Backend Java Spring Boot', company: 'VNG', status: 'pending', date: '21/11/2026' },
  { id: 3, title: 'UI/UX Designer', company: 'Tiki', status: 'active', date: '21/11/2026' },
];

function buildChartPath(data: number[]) {
  const width = 760;
  const height = 220;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function DashboardPage() {
  const path = buildChartPath(chartPoints);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Dashboard Quan quản trị
        </Title>
        <Text style={{ color: '#64748b', fontSize: 15 }}>
          Theo dõi dữ liệu vận hành nền tảng tuyển dụng theo thời gian thực.
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {overviewData.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.key}>
            <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <Statistic title={<Text style={{ color: '#64748b' }}>{item.title}</Text>} value={item.value} prefix={<span style={{ color: item.color }}>{item.icon}</span>} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<Text strong style={{ color: '#0f172a' }}>Biểu đồ tăng trưởng</Text>} style={{ borderRadius: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <svg viewBox="0 0 760 240" width="100%" height="240" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="0"
              y1={40 + i * 50}
              x2="760"
              y2={40 + i * 50}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          <path d={`${path} L 760 240 L 0 240 Z`} fill="url(#lineArea)" />
          <path d={path} fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title={<Text strong style={{ color: '#0f172a' }}>Tin tuyển dụng mới</Text>} style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }} extra={<Tag color="green">+12% tuần này</Tag>}>
            <Table
              rowKey="id"
              pagination={false}
              dataSource={recentJobs}
              columns={[
                { title: 'Vị trí', dataIndex: 'title', key: 'title' },
                { title: 'Công ty', dataIndex: 'company', key: 'company' },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (value: string) =>
                    value === 'active' ? <Tag color="green">Đang tuyển</Tag> : <Tag color="gold">Chờ duyệt</Tag>,
                },
                { title: 'Ngày đăng', dataIndex: 'date', key: 'date' },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title={<Text strong style={{ color: '#0f172a' }}>Hiệu suất hệ thống</Text>} style={{ height: '100%', borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Tỷ lệ duyệt tin</Text>
              <Progress percent={93} strokeColor="#16a34a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Người dùng hoạt động hôm nay</Text>
              <Progress percent={68} strokeColor="#16a34a" />
            </div>
            <div>
              <Text strong>Báo cáo vi phạm mở</Text>
              <Progress percent={16} status="exception" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
