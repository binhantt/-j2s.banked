import { Button, Card } from 'antd';
import {
  GoogleOutlined,
  GithubOutlined,
  FacebookOutlined,
  UserOutlined,
  CodeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export const RegisterFeature = () => {
  const [selectedType, setSelectedType] = useState<'job_seeker' | 'freelancer' | 'hr' | null>(null);
  const router = useRouter();

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">V</span>
              </div>
              <span className="text-3xl font-bold text-gray-800">
                ViệcLàm<span className="text-indigo-600">24h</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Chọn loại tài khoản
            </h1>
            <p className="text-lg text-gray-600">
              Bạn muốn tìm việc làm hay làm freelance?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Job Seeker */}
            <Card
              hoverable
              onClick={() => setSelectedType('job_seeker')}
              className="border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <UserOutlined className="text-3xl text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Tìm việc làm
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Tìm kiếm công việc full-time, part-time từ các công ty uy tín.
                </p>
                <ul className="text-left space-y-1 text-xs text-gray-600 mb-4">
                  <li>✓ Tạo CV online</li>
                  <li>✓ Ứng tuyển không giới hạn</li>
                  <li>✓ Chat với HR</li>
                </ul>
                <Button
                  type="primary"
                  size="large"
                  block
                  className="h-10 text-sm font-semibold"
                >
                  Chọn
                </Button>
              </div>
            </Card>

            {/* Freelancer */}
            <Card
              hoverable
              onClick={() => setSelectedType('freelancer')}
              className="border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CodeOutlined className="text-3xl text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Freelancer
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Tìm dự án freelance phù hợp với kỹ năng của bạn.
                </p>
                <ul className="text-left space-y-1 text-xs text-gray-600 mb-4">
                  <li>✓ Tìm dự án phù hợp</li>
                  <li>✓ Gửi proposal</li>
                  <li>✓ Quản lý dự án</li>
                </ul>
                <Button
                  size="large"
                  block
                  className="h-10 text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
                >
                  Chọn
                </Button>
              </div>
            </Card>

            {/* HR */}
            <Card
              hoverable
              onClick={() => setSelectedType('hr')}
              className="border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TeamOutlined className="text-3xl text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Nhà tuyển dụng
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Đăng tin tuyển dụng và tìm kiếm ứng viên tiềm năng.
                </p>
                <ul className="text-left space-y-1 text-xs text-gray-600 mb-4">
                  <li>✓ Đăng tin tuyển dụng</li>
                  <li>✓ Tìm ứng viên</li>
                  <li>✓ Quản lý ứng tuyển</li>
                </ul>
                <Button
                  size="large"
                  block
                  className="h-10 text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700"
                >
                  Chọn
                </Button>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <span className="text-gray-600">Đã có tài khoản? </span>
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">
              ViệcLàm<span className="text-indigo-600">24h</span>
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký</h1>
            <p className="text-gray-600">Chọn phương thức đăng ký</p>
          </div>

          {/* Social Register */}
          <div className="space-y-4">
            <Button
              size="large"
              block
              icon={<GoogleOutlined className="text-xl" />}
              className="h-14 font-medium text-base border-2 hover:border-red-500 hover:text-red-500 hover:shadow-lg transition-all"
            >
              Đăng ký với Google
            </Button>
            <Button
              size="large"
              block
              icon={<GithubOutlined className="text-xl" />}
              className="h-14 font-medium text-base border-2 hover:border-gray-800 hover:text-gray-800 hover:shadow-lg transition-all"
            >
              Đăng ký với GitHub
            </Button>
            <Button
              size="large"
              block
              icon={<FacebookOutlined className="text-xl" />}
              className="h-14 font-medium text-base border-2 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all"
            >
              Đăng ký với Facebook
            </Button>
          </div>

          <div className="text-center mt-8">
            <span className="text-gray-600">Đã có tài khoản? </span>
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
