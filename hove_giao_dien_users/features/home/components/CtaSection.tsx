import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';

export const CtaSection = () => {
  return (
    <section className="bg-white border-b border-gray-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 sm:p-12 md:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4 sm:mb-5">
            Sẵn sàng cho bước tiếp theo trong sự nghiệp?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Tạo hồ sơ một lần, theo dõi toàn bộ quá trình ứng tuyển và trao đổi trực tiếp với nhà tuyển dụng.
          </p>
          <Link href="/jobs">
            <Button
              type="primary"
              size="large"
              className="h-11 sm:h-12 px-6 sm:px-10 text-sm sm:text-base font-medium"
              icon={<ArrowRightOutlined />}
            >
              Khám phá việc làm phù hợp
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

