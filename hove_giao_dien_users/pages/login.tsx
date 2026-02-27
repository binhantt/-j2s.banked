import { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { GithubOutlined, UserOutlined, TeamOutlined, CodeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

declare global {
  interface Window {
    google?: any;
  }
}

type UserType = 'job_seeker' | 'freelancer' | 'hr';

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('job_seeker');
  const router = useRouter();
  const { googleLogin, githubLogin } = useAuthStore();

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = router.query.code as string;
    if (code && !githubLoading) {
      // Restore userType from localStorage
      const savedUserType = localStorage.getItem('pendingUserType') as UserType;
      if (savedUserType) {
        setUserType(savedUserType);
        localStorage.removeItem('pendingUserType');
      }
      handleGithubCallback(code);
    }
  }, [router.query.code]);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGithubCallback = async (code: string) => {
    setGithubLoading(true);
    try {
      await githubLogin(code, userType);
      message.success('Đăng nhập GitHub thành công!');
      router.push('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng nhập GitHub thất bại');
      // Remove code from URL
      router.replace('/login', undefined, { shallow: true });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;
    const scope = 'read:user user:email';
    
    // Save userType to localStorage before redirect
    localStorage.setItem('pendingUserType', userType);
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  const handleGoogleLogin = () => {
    if (googleLoading) return;
    
    setGoogleLoading(true);
    
    if (typeof window.google !== 'undefined' && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Use renderButton instead of prompt to avoid popup blocker
        const buttonDiv = document.createElement('div');
        buttonDiv.style.position = 'absolute';
        buttonDiv.style.top = '-9999px';
        document.body.appendChild(buttonDiv);
        
        window.google.accounts.id.renderButton(buttonDiv, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 250,
        });
        
        // Trigger click on the hidden button
        setTimeout(() => {
          const googleButton = buttonDiv.querySelector('div[role="button"]') as HTMLElement;
          if (googleButton) {
            googleButton.click();
          } else {
            // Fallback to prompt if renderButton fails
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                setGoogleLoading(false);
                message.info('Vui lòng click lại nút Google để đăng nhập');
              }
            });
          }
          // Clean up
          setTimeout(() => {
            if (buttonDiv.parentNode) {
              buttonDiv.parentNode.removeChild(buttonDiv);
            }
          }, 1000);
        }, 100);
      } catch (error) {
        console.error('Google Sign-In error:', error);
        setGoogleLoading(false);
        message.error('Không thể khởi tạo Google Sign-In. Vui lòng thử lại.');
      }
    } else {
      setGoogleLoading(false);
      message.error('Google Sign-In chưa sẵn sàng. Vui lòng tải lại trang.');
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      const idToken = response.credential;
      await googleLogin(idToken, userType);
      message.success('Đăng nhập Google thành công!');
      router.push('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-teal-600 bg-clip-text text-transparent">V</span>
            </div>
            <span className="text-3xl font-bold text-white">ViệcLàm24h</span>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Tìm công việc<br />mơ ước của bạn
          </h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Kết nối với hàng nghìn cơ hội việc làm từ các công ty hàng đầu
          </p>
        </div>

        <div className="relative z-10 text-white/80 text-sm">
          © 2024 ViệcLàm24h. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-xl rounded-2xl border-0 p-4">
            <div className="text-center mb-8">
              <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
                <span className="text-white font-bold text-3xl">V</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h1>
              <p className="text-gray-600">Chào mừng bạn trở lại!</p>
            </div>

            {/* User Type Selection */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-4 text-center">Chọn loại tài khoản</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setUserType('job_seeker')}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    userType === 'job_seeker'
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      userType === 'job_seeker' ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <UserOutlined className={`text-xl ${
                        userType === 'job_seeker' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold text-sm ${
                        userType === 'job_seeker' ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        Ứng viên
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Tìm việc</div>
                    </div>
                  </div>
                  {userType === 'job_seeker' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setUserType('freelancer')}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    userType === 'freelancer'
                      ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      userType === 'freelancer' ? 'bg-purple-500' : 'bg-gray-100'
                    }`}>
                      <CodeOutlined className={`text-xl ${
                        userType === 'freelancer' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold text-sm ${
                        userType === 'freelancer' ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        Freelancer
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Tìm dự án</div>
                    </div>
                  </div>
                  {userType === 'freelancer' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setUserType('hr')}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    userType === 'hr'
                      ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      userType === 'hr' ? 'bg-green-500' : 'bg-gray-100'
                    }`}>
                      <TeamOutlined className={`text-xl ${
                        userType === 'hr' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold text-sm ${
                        userType === 'hr' ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        Nhà tuyển dụng
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Đăng tin</div>
                    </div>
                  </div>
                  {userType === 'hr' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* OAuth Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-14 rounded-xl font-semibold text-base border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-red-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900">Tiếp tục với Google</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGithubLogin}
                disabled={githubLoading}
                className="w-full h-14 rounded-xl font-semibold text-base border-2 border-gray-200 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {githubLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <GithubOutlined className="text-2xl text-gray-700 group-hover:text-white transition-colors" />
                    <span className="text-gray-700 group-hover:text-white transition-colors">Tiếp tục với GitHub</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
                <span>←</span> Quay lại trang chủ
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
