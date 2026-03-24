import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';

export const CtaSection = () => {
  return (
    <section style={{ background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #dcfce7',
          borderRadius: 16,
          padding: 'clamp(32px, 6vw, 56px)',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(20px, 4vw, 36px)',
            fontWeight: 700,
            color: '#0b1220',
            marginBottom: 16,
          }}>
            Sẵn sàng cho bước tiếp theo trong sự nghiệp?
          </h2>
          <p style={{
            fontSize: 16,
            color: '#64748b',
            marginBottom: 32,
            maxWidth: 600,
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            Tạo hồ sơ một lần, theo dõi toàn bộ quá trình ứng tuyển và trao đổi trực tiếp với nhà tuyển dụng.
          </p>
          <Link href="/jobs">
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              style={{
                height: 48,
                borderRadius: 12,
                background: '#16a34a',
                border: 'none',
                fontWeight: 600,
                fontSize: 15,
                paddingInline: 32,
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              }}
            >
              Khám phá việc làm phù hợp
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
