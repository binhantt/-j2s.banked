export const IntroSection = () => {
  return (
    <section className="relative bg-white border-y border-gray-100 min-h-screen flex items-center">
      {/* subtle background blocks */}
      <div className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-3xl bg-cyan-50" />
      <div className="pointer-events-none absolute -right-14 bottom-10 h-52 w-52 rounded-full bg-emerald-50" />

      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-xs font-medium text-gray-600 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Giới thiệu nền tảng
        </div>

        <div className="grid gap-8 md:gap-10 md:grid-cols-3 rounded-2xl border border-gray-100 bg-white/70 shadow-sm p-6 sm:p-8">
          <div className="border-r border-gray-100 pr-0 md:pr-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
              Nền tảng tìm việc toàn diện
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Website giúp bạn tìm việc fulltime, part-time và dự án freelance trên cùng một hệ thống,
              từ khâu tìm kiếm, ứng tuyển cho tới trao đổi với nhà tuyển dụng.
            </p>
          </div>
          <div className="md:border-r md:border-gray-100 md:px-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Dành cho ứng viên
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li>• Tạo và lưu nhiều CV, chủ động bật/tắt hiển thị.</li>
              <li>• Theo dõi trạng thái từng đơn ứng tuyển theo thời gian thực.</li>
              <li>• Nhận gợi ý việc làm phù hợp với kỹ năng và kinh nghiệm.</li>
            </ul>
          </div>
          <div className="md:pl-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Dành cho nhà tuyển dụng
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li>• Đăng tin tuyển dụng nhanh, quản lý ứng viên theo từng vị trí.</li>
              <li>• Hệ thống chat giúp trao đổi trực tiếp với ứng viên.</li>
              <li>• Thống kê lượt xem, số CV và hiệu quả chiến dịch tuyển dụng.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};


