import { Layout, Row, Col, Space } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="bg-gray-50 border-t border-gray-200 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[32, 32]} className="mb-8">
          {/* Company Info */}
          <Col xs={24} sm={12} md={8}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  ViệcLàm24h
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Nền tảng tìm kiếm việc làm hàng đầu Việt Nam. Kết nối ứng viên
                với hàng nghìn cơ hội nghề nghiệp.
              </p>
            </div>
            <Space size="large">
              <a
                href="#"
                className="text-gray-500 hover:text-indigo-600 hover:scale-110 transition-all duration-200"
              >
                <FacebookOutlined className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-indigo-600 hover:scale-110 transition-all duration-200"
              >
                <TwitterOutlined className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-indigo-600 hover:scale-110 transition-all duration-200"
              >
                <LinkedinOutlined className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-indigo-600 hover:scale-110 transition-all duration-200"
              >
                <InstagramOutlined className="text-xl" />
              </a>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={8}>
            <h3 className="text-gray-900 font-semibold text-base mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-sm inline-block"
                >
                  Tìm việc làm
                </Link>
              </li>
              <li>
                <Link
                  href="/freelance"
                  className="text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-sm inline-block"
                >
                  Freelance
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-sm inline-block"
                >
                  Công ty
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-sm inline-block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/cv-builder"
                  className="text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 text-sm inline-block"
                >
                  Tạo CV online
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={8}>
            <h3 className="text-gray-900 font-semibold text-base mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <EnvironmentOutlined className="text-indigo-600 text-base mt-0.5" />
                <span className="text-gray-600 text-sm leading-relaxed">
                  Tầng 10, Tòa nhà ABC, 123 Nguyễn Huệ, Q.1, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneOutlined className="text-indigo-600 text-base" />
                <a
                  href="tel:+84123456789"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MailOutlined className="text-indigo-600 text-base" />
                <a
                  href="mailto:contact@vieclam24h.vn"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  contact@vieclam24h.vn
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} md={12} className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                © {currentYear} ViệcLàm24h. All rights reserved.
              </p>
            </Col>
            <Col xs={24} md={12} className="text-center md:text-right">
              <Space size="middle" wrap className="text-sm">
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Điều khoản
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/cookies"
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Cookie
                </Link>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};
