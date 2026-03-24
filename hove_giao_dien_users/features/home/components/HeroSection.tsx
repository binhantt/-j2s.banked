import { Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';

const stats = [
  { number: '10,000+', label: 'Việc làm đang mở' },
  { number: '5,000+', label: 'Doanh nghiệp hợp tác' },
  { number: '50,000+', label: 'Ứng viên đang sử dụng' },
  { number: '95%', label: 'Tỷ lệ hài lòng' },
];

export const HeroSection = () => {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)',
      borderBottom: '1px solid #dcfce7',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-80px',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: '-80px',
        width: 500, height: 400,
        background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: 100,
        paddingBottom: 80,
        position: 'relative',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 100,
          background: 'rgba(22,163,74,0.08)',
          border: '1px solid rgba(22,163,74,0.15)',
          marginBottom: 24,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#16a34a',
          }} />
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#16a34a',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Nền tảng tìm việc & freelance cho người việt
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 700, color: '#0b1220',
          marginBottom: 20, lineHeight: 1.2, letterSpacing: '-0.02em',
        }}>
          Tìm việc làm, dự án freelance
          <br />
          trên một nền tảng duy nhất.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#64748b', marginBottom: 36,
          maxWidth: 640, lineHeight: 1.7,
        }}>
          Xây dựng hồ sơ chuyên nghiệp, kết nối với nhà tuyển dụng, quản lý toàn bộ quá trình ứng tuyển
          và thanh toán an toàn cho cả công việc fulltime lẫn freelance.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          <Link href="/jobs">
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              style={{
                height: 48, borderRadius: 12,
                background: '#16a34a', border: 'none',
                fontWeight: 600, fontSize: 15,
                paddingInline: 28,
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              }}
            >
              Bắt đầu tìm việc
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="large"
              style={{
                height: 48, borderRadius: 12,
                border: '1.5px solid #d1d5db',
                color: '#374151', fontWeight: 600,
                fontSize: 15, paddingInline: 28,
              }}
            >
              Dành cho nhà tuyển dụng
            </Button>
          </Link>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, fontSize: 13, color: '#64748b' }}>
          {[
            'Không thu phí ứng viên',
            'Bảo mật hồ sơ & CV',
            'Hỗ trợ 1-1 khi gặp vấn đề',
          ].map((item) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
              {item}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div style={{ marginTop: 64, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(32px, 6vw, 80px)' }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#0b1220', letterSpacing: '-0.02em' }}>
                {stat.number}
              </div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
