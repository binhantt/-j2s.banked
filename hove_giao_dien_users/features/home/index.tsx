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
      icon: <SearchOutlined className="text-4xl text-indigo-600" />,
      title: 'Tìm kiếm thông minh',
      description:
        'Tìm công việc phù hợp với bộ lọc nâng cao. Tìm kiếm theo vị trí, địa điểm, mức lương và nhiều hơn nữa.',
    },
    {
      icon: <FileTextOutlined className="text-4xl text-indigo-600" />,
      title: 'Ứng tuyển dễ dàng',
      description:
        'Ứng tuyển nhiều công việc chỉ với một cú click. Upload CV một lần và ứng tuyển hàng trăm vị trí.',
    },
    {
      icon: <BellOutlined className="text-4xl text-indigo-600" />,
      title: 'Thông báo việc làm',
      description:
        'Nhận thông báo khi có việc làm mới phù hợp với tiêu chí của bạn. Không bỏ lỡ cơ hội nào.',
    },
    {
      icon: <SafetyOutlined className="text-4xl text-indigo-600" />,
      title: 'Công ty uy tín',
      description:
        'Tất cả công ty đều được xác minh để đảm bảo độ tin cậy. Ứng tuyển với sự tự tin vào nhà tuyển dụng.',
    },
    {
      icon: <RocketOutlined className="text-4xl text-indigo-600" />,
      title: 'Phát triển sự nghiệp',
      description:
        'Truy cập tài nguyên nghề nghiệp, mẹo và hướng dẫn để giúp bạn thăng tiến trong hành trình chuyên môn.',
    },
    {
      icon: <TeamOutlined className="text-4xl text-indigo-600" />,
      title: 'Đánh giá công ty',
      description:
        'Đọc đánh giá từ nhân viên hiện tại và cũ. Đưa ra quyết định sáng suốt về nhà tuyển dụng tiếp theo.',
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
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Tìm Công Việc{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Mơ Ước
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Kết nối với các nhà tuyển dụng hàng đầu và khám phá hàng nghìn cơ
            hội nghề nghiệp phù hợp với kỹ năng và nguyện vọng của bạn.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/jobs">
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                className="h-14 px-10 text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Bắt đầu tìm việc
              </Button>
            </Link>
            <Button
              size="large"
              className="h-14 px-10 text-lg font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Dành cho nhà tuyển dụng
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 mb-20">
        <Row gutter={[24, 24]}>
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={12} md={6}>
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-lg">
                  {stat.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tại sao chọn ViệcLàm24h?
          </h2>
          <p className="text-xl text-gray-600">
            Mọi thứ bạn cần để tìm cơ hội nghề nghiệp tiếp theo
          </p>
        </div>

        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card
                className="h-full border-2 border-gray-100 rounded-2xl hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
                bodyStyle={{ padding: '40px' }}
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {feature.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn ứng viên đã tìm được công việc mơ ước
            thông qua nền tảng của chúng tôi
          </p>
          <Link href="/jobs">
            <Button
              type="default"
              size="large"
              className="h-14 px-10 text-lg font-medium bg-white text-indigo-600 hover:bg-gray-50 border-0 shadow-lg"
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
