import { Layout, Row, Col, Space, Button, Input } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300 pt-16 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <Row gutter={[48, 48]} className="mb-12">
          {/* Company Info */}
          <Col xs={24} sm={24} md={8}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">V</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  ViệcLàm<span className="text-indigo-400">24h</span>
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Nền tảng tìm kiếm việc làm hàng đầu Việt Nam. Kết nối ứng viên
                với hàng nghìn cơ hội nghề nghiệp từ các công ty uy tín.
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Đăng ký nhận thông báo việc làm mới
                </p>
                <Input.Search
                  placeholder="Email của bạn"
                  enterButton={<SendOutlined />}
                  size="large"
                  className="max-w-sm"
                />
              </div>
            </div>
            <Space size="large">
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <FacebookOutlined className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <TwitterOutlined className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <LinkedinOutlined className="text-2xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <InstagramOutlined className="text-2xl" />
              </a>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={5}>
            <h3 className="text-white font-bold text-lg mb-6">
              Dành cho ứng viên
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/jobs"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Tìm việc làm
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Danh sách công ty
                </Link>
              </li>
              <li>
                <Link
                  href="/resume"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Tạo CV online
                </Link>
              </li>
              <li>
                <Link
                  href="/career-advice"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Cẩm nang nghề nghiệp
                </Link>
              </li>
              <li>
                <Link
                  href="/salary"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Thống kê lương
                </Link>
              </li>
            </ul>
          </Col>

          {/* For Employers */}
          <Col xs={24} sm={12} md={5}>
            <h3 className="text-white font-bold text-lg mb-6">
              Dành cho nhà tuyển dụng
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/post-job"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Bảng giá dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  href="/browse-candidates"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Tìm ứng viên
                </Link>
              </li>
              <li>
                <Link
                  href="/employer-resources"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Tài nguyên HR
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-sales"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Liên hệ hợp tác
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={24} md={6}>
            <h3 className="text-white font-bold text-lg mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <EnvironmentOutlined className="text-indigo-400 text-lg mt-1" />
                <span className="text-gray-400 leading-relaxed">
                  Tầng 10, Tòa nhà ABC
                  <br />
                  123 Nguyễn Huệ, Q.1
                  <br />
                  TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneOutlined className="text-indigo-400 text-lg" />
                <a
                  href="tel:+84123456789"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MailOutlined className="text-indigo-400 text-lg" />
                <a
                  href="mailto:contact@vieclam24h.vn"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  contact@vieclam24h.vn
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} md={12} className="text-center md:text-left">
              <p className="text-gray-400">
                © {currentYear} ViệcLàm24h. Bản quyền thuộc về chúng tôi.
              </p>
            </Col>
            <Col xs={24} md={12} className="text-center md:text-right">
              <Space split="|" size="middle" wrap>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
                <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Chính sách Cookie
                </Link>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};
