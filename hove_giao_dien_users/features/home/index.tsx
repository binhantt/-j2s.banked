import { Button, Card, Row, Col } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  BellOutlined,
  SafetyOutlined,
  RocketOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

export const HomeFeature = () => {
  const features = [
    {
      icon: <SearchOutlined className="text-3xl text-blue-600" />,
      title: 'Tìm kiếm thông minh',
      description:
        'Tìm công việc phù hợp với bộ lọc nâng cao theo vị trí, địa điểm, mức lương.',
    },
    {
      icon: <FileTextOutlined className="text-3xl text-cyan-600" />,
      title: 'Ứng tuyển dễ dàng',
      description:
        'Upload CV một lần và ứng tuyển nhiều vị trí chỉ với một cú click.',
    },
    {
      icon: <BellOutlined className="text-3xl text-teal-600" />,
      title: 'Thông báo việc làm',
      description:
        'Nhận thông báo khi có việc làm mới phù hợp. Không bỏ lỡ cơ hội nào.',
    },
    {
      icon: <SafetyOutlined className="text-3xl text-blue-600" />,
      title: 'Công ty uy tín',
      description:
        'Tất cả công ty đều được xác minh để đảm bảo độ tin cậy cao nhất.',
    },
    {
      icon: <RocketOutlined className="text-3xl text-cyan-600" />,
      title: 'Phát triển sự nghiệp',
      description:
        'Truy cập tài nguyên nghề nghiệp, mẹo và hướng dẫn phát triển.',
    },
    {
      icon: <TeamOutlined className="text-3xl text-teal-600" />,
      title: 'Đánh giá công ty',
      description:
        'Đọc đánh giá từ nhân viên. Đưa ra quyết định sáng suốt.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Việc làm' },
    { number: '5,000+', label: 'Công ty' },
    { number: '50,000+', label: 'Ứng viên' },
    { number: '95%', label: 'Thành công' },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-4 sm:mb-6">
            Tìm Công Việc{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
              Mơ Ước
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto">
            Kết nối với các nhà tuyển dụng hàng đầu và khám phá hàng nghìn cơ
            hội nghề nghiệp phù hợp với kỹ năng của bạn.
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
            <Link href="/jobs">
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-medium"
              >
                Bắt đầu tìm việc
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="large"
                className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-medium"
              >
                Dành cho nhà tuyển dụng
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 mb-16 sm:mb-20">
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={12} md={6}>
              <div className="text-center bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base md:text-lg">
                  {stat.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-3 sm:mb-4">
            Tại sao chọn ViệcLàm24h?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Mọi thứ bạn cần để tìm cơ hội nghề nghiệp tiếp theo
          </p>
        </div>

        <Row gutter={[16, 16]}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card
                className="h-full hover:shadow-lg transition-all"
                bodyStyle={{ padding: '24px' }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 sm:p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10 opacity-95 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn ứng viên đã tìm được công việc mơ ước
            thông qua nền tảng của chúng tôi
          </p>
          <Link href="/jobs">
            <Button
              type="default"
              size="large"
              className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-medium bg-white text-blue-600 hover:bg-gray-50"
              icon={<ArrowRightOutlined />}
            >
              Khám phá việc làm ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
