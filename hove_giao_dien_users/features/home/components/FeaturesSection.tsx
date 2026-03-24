import { Card, Row, Col } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  BellOutlined,
  SafetyOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const features = [
  {
    icon: <SearchOutlined style={{ fontSize: 32, color: '#16a34a' }} />,
    title: 'Tìm kiếm thông minh',
    description: 'Tìm công việc phù hợp với bộ lọc nâng cao theo vị trí, địa điểm, mức lương.',
  },
  {
    icon: <FileTextOutlined style={{ fontSize: 32, color: '#16a34a' }} />,
    title: 'Ứng tuyển dễ dàng',
    description: 'Upload CV một lần và ứng tuyển nhiều vị trí chỉ với một cú click.',
  },
  {
    icon: <BellOutlined style={{ fontSize: 32, color: '#16a34a' }} />,
    title: 'Thông báo việc làm',
    description: 'Nhận thông báo khi có việc làm mới phù hợp. Không bỏ lỡ cơ hội nào.',
  },
  {
    icon: <SafetyOutlined style={{ fontSize: 32, color: '#16a34a' }} />,
    title: 'Công ty uy tín',
    description: 'Tất cả công ty đều được xác minh để đảm bảo độ tin cậy cao nhất.',
  },
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: '#16a34a' }} />,
    title: 'Phát triển sự nghiệp',
    description: 'Truy cập tài nguyên nghề nghiệp, mẹo và hướng dẫn phát triển.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: '#16a34a' }} />,
    title: 'Đánh giá công ty',
    description: 'Đọc đánh giá từ nhân viên. Đưa ra quyết định sáng suốt.',
  },
];

export const FeaturesSection = () => {
  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #f0fdf4' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 36px)',
            fontWeight: 700,
            color: '#0b1220',
            marginBottom: 12,
          }}>
            Vì sao nên chọn ViệcLàm24h?
          </h2>
          <p style={{ fontSize: 16, color: '#64748b' }}>
            Bộ công cụ đầy đủ cho hành trình tìm việc và quản lý sự nghiệp của bạn.
          </p>
        </div>

        <Row gutter={[16, 16]}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card
                style={{
                  height: '100%',
                  borderRadius: 14,
                  border: '1px solid #f0fdf4',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                styles={{ body: { padding: '24px' } }}
                hoverable
              >
                <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#0b1220',
                  marginBottom: 8,
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#64748b',
                  lineHeight: 1.7,
                }}>
                  {feature.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};
