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
    <AntFooter
      style={{
        background: '#0b1220',
        borderTop: '1px solid rgba(22,163,74,0.15)',
        paddingTop: 48,
        paddingBottom: 24,
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[32, 32]} style={{ marginBottom: 32 }}>
          {/* Logo & Description */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>V</span>
              </div>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#f8fafc',
              }}>
                ViệcLàm24h
              </span>
            </div>
            <p style={{
              color: '#64748b',
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 20,
            }}>
              Nền tảng tìm kiếm việc làm và freelance hàng đầu Việt Nam. Kết nối ứng viên với hàng nghìn cơ hội nghề nghiệp từ các công ty uy tín.
            </p>
            <Space size="middle">
              <a
                href="#"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(22,163,74,0.1)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#16a34a',
                  transition: 'all 0.2s',
                }}
              >
                <FacebookOutlined style={{ fontSize: 16 }} />
              </a>
              <a
                href="#"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(22,163,74,0.1)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#16a34a',
                  transition: 'all 0.2s',
                }}
              >
                <TwitterOutlined style={{ fontSize: 16 }} />
              </a>
              <a
                href="#"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(22,163,74,0.1)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#16a34a',
                  transition: 'all 0.2s',
                }}
              >
                <LinkedinOutlined style={{ fontSize: 16 }} />
              </a>
              <a
                href="#"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(22,163,74,0.1)',
                  border: '1px solid rgba(22,163,74,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#16a34a',
                  transition: 'all 0.2s',
                }}
              >
                <InstagramOutlined style={{ fontSize: 16 }} />
              </a>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={8}>
            <h3 style={{
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 16,
            }}>
              Liên kết nhanh
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/jobs', label: 'Tìm việc làm' },
                { href: '/freelance', label: 'Freelance' },
                { href: '/companies', label: 'Công ty' },
                { href: '/blog', label: 'Blog' },
                { href: '/cv-builder', label: 'Tạo CV online' },
              ].map((item) => (
                <li key={item.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={item.href}
                    style={{
                      color: '#64748b',
                      fontSize: 14,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Contact */}
          <Col xs={24} sm={12} md={8}>
            <h3 style={{
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 16,
            }}>
              Liên hệ
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <EnvironmentOutlined style={{ color: '#16a34a', fontSize: 16, marginTop: 2 }} />
                <span style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Tầng 10, Tòa nhà ABC, 123 Nguyễn Huệ, Q.1, TP.HCM
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <PhoneOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                <a
                  href="tel:+84123456789"
                  style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}
                >
                  +84 123 456 789
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MailOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                <a
                  href="mailto:contact@vieclam24h.vn"
                  style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}
                >
                  contact@vieclam24h.vn
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(22,163,74,0.15)',
          paddingTop: 24,
        }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} md={12} style={{ textAlign: 'left' }}>
              <p style={{ color: '#475569', fontSize: 13 }}>
                © {currentYear} ViệcLàm24h. All rights reserved.
              </p>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space size="middle" wrap style={{ fontSize: 13 }}>
                {[
                  { href: '/privacy', label: 'Chính sách bảo mật' },
                  { href: '/terms', label: 'Điều khoản' },
                  { href: '/cookies', label: 'Cookie' },
                ].map((item, i) => (
                  <span key={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {i > 0 && <span style={{ color: '#1e293b' }}>|</span>}
                    <Link
                      href={item.href}
                      style={{
                        color: '#475569',
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      {item.label}
                    </Link>
                  </span>
                ))}
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};
