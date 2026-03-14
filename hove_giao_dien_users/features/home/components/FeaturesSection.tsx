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
    icon: <SearchOutlined className="text-3xl text-blue-600" />,
    title: 'Tìm kiếm thông minh',
    description: 'Tìm công việc phù hợp với bộ lọc nâng cao theo vị trí, địa điểm, mức lương.',
  },
  {
    icon: <FileTextOutlined className="text-3xl text-cyan-600" />,
    title: 'Ứng tuyển dễ dàng',
    description: 'Upload CV một lần và ứng tuyển nhiều vị trí chỉ với một cú click.',
  },
  {
    icon: <BellOutlined className="text-3xl text-teal-600" />,
    title: 'Thông báo việc làm',
    description: 'Nhận thông báo khi có việc làm mới phù hợp. Không bỏ lỡ cơ hội nào.',
  },
  {
    icon: <SafetyOutlined className="text-3xl text-blue-600" />,
    title: 'Công ty uy tín',
    description: 'Tất cả công ty đều được xác minh để đảm bảo độ tin cậy cao nhất.',
  },
  {
    icon: <RocketOutlined className="text-3xl text-cyan-600" />,
    title: 'Phát triển sự nghiệp',
    description: 'Truy cập tài nguyên nghề nghiệp, mẹo và hướng dẫn phát triển.',
  },
  {
    icon: <TeamOutlined className="text-3xl text-teal-600" />,
    title: 'Đánh giá công ty',
    description: 'Đọc đánh giá từ nhân viên. Đưa ra quyết định sáng suốt.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="bg-white border-b border-gray-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Vì sao nên chọn ViệcLàm24h?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Bộ công cụ đầy đủ cho hành trình tìm việc và quản lý sự nghiệp của bạn.
          </p>
        </div>

        <Row gutter={[16, 16]}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card
                className="h-full hover:shadow-md transition-all border-gray-100"
                bodyStyle={{ padding: '24px' }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

