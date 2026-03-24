export const IntroSection = () => {
  return (
    <section style={{
      background: '#fff',
      borderTop: '1px solid #f0fdf4',
      borderBottom: '1px solid #f0fdf4',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 14px',
          borderRadius: 100,
          background: '#f0fdf4',
          border: '1px solid #dcfce7',
          marginBottom: 32,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#16a34a',
          }} />
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#16a34a',
          }}>
            Giới thiệu nền tảng
          </span>
        </div>

        <div style={{
          display: 'grid',
          gap: 32,
          borderRadius: 16,
          background: '#fafffe',
          border: '1px solid #f0fdf4',
          padding: '32px',
        }}>
          {/* Left col */}
          <div style={{ borderRight: 'none' }}>
            <h2 style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 700,
              color: '#0b1220',
              marginBottom: 12,
            }}>
              Nền tảng tìm việc toàn diện
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8 }}>
              Website giúp bạn tìm việc fulltime, part-time và dự án freelance trên cùng một hệ thống,
              từ khâu tìm kiếm, ứng tuyển cho tới trao đổi với nhà tuyển dụng.
            </p>
          </div>

          {/* Right cols */}
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div>
              <h3 style={{
                fontSize: 16, fontWeight: 700,
                color: '#0b1220', marginBottom: 10,
              }}>
                Dành cho ứng viên
              </h3>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {[
                  'Tạo và lưu nhiều CV, chủ động bật/tắt hiển thị.',
                  'Theo dõi trạng thái từng đơn ứng tuyển theo thời gian thực.',
                  'Nhận gợi ý việc làm phù hợp với kỹ năng và kinh nghiệm.',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#64748b', marginBottom: 6, lineHeight: 1.6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{
                fontSize: 16, fontWeight: 700,
                color: '#0b1220', marginBottom: 10,
              }}>
                Dành cho nhà tuyển dụng
              </h3>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {[
                  'Đăng tin tuyển dụng nhanh, quản lý ứng viên theo từng vị trí.',
                  'Hệ thống chat giúp trao đổi trực tiếp với ứng viên.',
                  'Thống kê lượt xem, số CV và hiệu quả chiến dịch tuyển dụng.',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#64748b', marginBottom: 6, lineHeight: 1.6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
