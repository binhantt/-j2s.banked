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
        background: '#f8fafc',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        paddingTop: 64,
        paddingBottom: 32,
        marginTop: 80,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[48, 32]} style={{ marginBottom: 48 }}>
          {/* Logo & Description */}
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>V</span>
              </div>
              <span style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}>
                ViệcLàm<span style={{ color: '#16a34a' }}>24h</span>
              </span>
            </div>
            <p style={{
              color: '#64748b',
              fontSize: 14,
              lineHeight: 1.8,
              marginBottom: 24,
            }}>
              Nền tảng tìm kiếm việc làm và freelance hàng đầu Việt Nam. Kết nối ứng viên với hàng nghìn cơ hội nghề nghiệp từ các công ty uy tín.
            </p>
            <Space size="middle">
              {[FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#64748b',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#16a34a';
                    e.currentTarget.style.borderColor = 'rgba(22,163,74,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon style={{ fontSize: 18 }} />
                </a>
              ))}
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={8}>
            <h3 style={{
              color: '#0f172a',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 20,
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
                <li key={item.href} style={{ marginBottom: 12 }}>
                  <Link
                    href={item.href}
                    style={{
                      color: '#475569',
                      fontSize: 14,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
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
              color: '#0f172a',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 20,
            }}>
              Liên hệ
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <EnvironmentOutlined style={{ color: '#16a34a', fontSize: 18, marginTop: 2 }} />
                <span style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                  Tầng 10, Tòa nhà ABC, 123 Nguyễn Huệ, Q.1, TP.HCM
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <PhoneOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                <a
                  href="tel:+84123456789"
                  style={{ color: '#475569', fontSize: 14, textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  +84 123 456 789
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MailOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                <a
                  href="mailto:contact@vieclam24h.vn"
                  style={{ color: '#475569', fontSize: 14, textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  contact@vieclam24h.vn
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: 32,
        }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} md={12} style={{ textAlign: 'left' }}>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                © {currentYear} ViệcLàm24h. Được xây dựng với đam mê.
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
                    {i > 0 && <span style={{ color: '#e2e8f0' }}>|</span>}
                    <Link
                      href={item.href}
                      style={{
                        color: '#64748b',
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
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
