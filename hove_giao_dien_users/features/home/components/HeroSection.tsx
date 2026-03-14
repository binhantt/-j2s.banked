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
    <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-emerald-50 border-b border-gray-100">
      {/* Decor gradient left */}
      <div className="pointer-events-none absolute -left-32 sm:-left-40 top-0 bottom-1/3 w-80 sm:w-96 bg-cyan-100/70 blur-3xl" />
      {/* Decor gradient right */}
      <div className="pointer-events-none absolute -right-32 sm:-right-40 top-1/3 bottom-0 w-80 sm:w-96 bg-emerald-100/70 blur-3xl" />
      {/* Soft glow bottom-center */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-t from-emerald-100/80 via-transparent to-transparent blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-20">
        <p className="uppercase tracking-[0.18em] text-xs sm:text-sm text-gray-500 mb-4">
          NỀN TẢNG TÌM VIỆC & FREELANCE CHO NGƯỜI VIỆT
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
          Tìm việc làm, dự án freelance
          <br className="hidden sm:block" />
          <span className="font-bold">trên một nền tảng duy nhất.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Xây dựng hồ sơ chuyên nghiệp, kết nối với nhà tuyển dụng, quản lý toàn bộ quá trình ứng tuyển
          và thanh toán an toàn cho cả công việc fulltime lẫn freelance.
        </p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6">
          <Link href="/jobs">
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium"
            >
              Bắt đầu tìm việc
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="large"
              className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium border-gray-300 text-gray-900"
            >
              Dành cho nhà tuyển dụng
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Không thu phí ứng viên
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Bảo mật hồ sơ & CV
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Hỗ trợ 1-1 khi gặp vấn đề
          </div>
        </div>

        {/* Stats dưới hero */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center min-w-[110px]">
              <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{stat.number}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

