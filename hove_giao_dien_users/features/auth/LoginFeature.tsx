import { Button, Card, message, Modal } from 'antd';
import { GithubOutlined, GoogleOutlined, UserOutlined, TeamOutlined, CodeOutlined, FacebookOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useCallback, memo, useEffect } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

const UserTypeModal = memo(({ 
  visible, 
  onCancel, 
  onSelect, 
  loading 
}: { 
  visible: boolean; 
  onCancel: () => void; 
  onSelect: (type: 'job_seeker' | 'freelancer' | 'hr') => void;
  loading: boolean;
}) => (
  <Modal
    open={visible}
    onCancel={onCancel}
    footer={null}
    centered
    width={500}
    className="user-type-modal"
  >
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn loại tài khoản</h2>
      <p className="text-gray-600">Bạn muốn đăng nhập với vai trò nào?</p>
    </div>
    <div className="space-y-3">
      <button
        onClick={() => onSelect('job_seeker')}
        disabled={loading}
        className="w-full p-4 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group disabled:opacity-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
            <UserOutlined className="text-2xl text-indigo-600 group-hover:text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-gray-900">Người tìm việc</h3>
            <p className="text-sm text-gray-600">Tìm kiếm công việc phù hợp</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect('freelancer')}
        disabled={loading}
        className="w-full p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
            <CodeOutlined className="text-2xl text-green-600 group-hover:text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-gray-900">Freelancer</h3>
            <p className="text-sm text-gray-600">Nhận dự án freelance</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onSelect('hr')}
        disabled={loading}
        className="w-full p-4 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group disabled:opacity-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <TeamOutlined className="text-2xl text-orange-600 group-hover:text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-semibold text-gray-900">Nhà tuyển dụng</h3>
            <p className="text-sm text-gray-600">Đăng tin và tìm ứng viên</p>
          </div>
        </div>
      </button>
    </div>
  </Modal>
));

UserTypeModal.displayName = 'UserTypeModal';

export const LoginFeature = () => {
  const router = useRouter();
  const { googleLogin, githubLogin, facebookLogin, isLoading } = useAuthStore();
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string>('');
  const [pendingGitHubCode, setPendingGitHubCode] = useState<string>('');
  const [pendingFacebookToken, setPendingFacebookToken] = useState<string>('');
  const [loginMethod, setLoginMethod] = useState<'google' | 'github' | 'facebook'>('google');

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    // Always show user type modal
    setPendingIdToken(idToken);
    setLoginMethod('google');
    setShowUserTypeModal(true);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // Always show user type modal for GitHub login
      setPendingGitHubCode(code);
      setLoginMethod('github');
      setShowUserTypeModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Load Google SDK
    if (GOOGLE_CLIENT_ID && !document.getElementById('google-sdk')) {
      const script = document.createElement('script');
      script.id = 'google-sdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize Google after SDK loads
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSuccess,
          });
        }
      };
      document.body.appendChild(script);
    } else if ((window as any).google) {
      // SDK already loaded, just initialize
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSuccess,
      });
    }

    // Load Facebook SDK
    if (FACEBOOK_APP_ID && !window.FB) {
      loadFacebookSDK();
    }
  }, [handleGoogleSuccess]);

  const loadFacebookSDK = () => {
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  const handleGoogleLogin = useCallback(() => {
    if ((window as any).google) {
      try {
        // Use renderButton instead of prompt to avoid FedCM issues
        const buttonDiv = document.createElement('div');
        buttonDiv.style.display = 'none';
        document.body.appendChild(buttonDiv);
        
        (window as any).google.accounts.id.renderButton(buttonDiv, {
          type: 'standard',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        });
        
        // Trigger click on the hidden button
        const googleButton = buttonDiv.querySelector('div[role="button"]');
        if (googleButton) {
          (googleButton as HTMLElement).click();
        }
        
        // Clean up after a delay
        setTimeout(() => {
          document.body.removeChild(buttonDiv);
        }, 1000);
      } catch (error) {
        console.error('Google login error:', error);
        message.error('Đăng nhập Google thất bại. Vui lòng thử lại!');
      }
    } else {
      message.error('Google SDK chưa được tải. Vui lòng thử lại!');
    }
  }, []);

  const handleGitHubLogin = useCallback(() => {
    const redirectUri = `${window.location.origin}/login`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = githubAuthUrl;
  }, []);

  const handleFacebookLogin = useCallback(() => {
    if (!(window as any).FB) {
      message.error('Facebook SDK chưa được tải. Vui lòng thử lại!');
      return;
    }

    (window as any).FB.login(async (response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        // Always show user type modal
        setPendingFacebookToken(accessToken);
        setLoginMethod('facebook');
        setShowUserTypeModal(true);
      } else {
        message.error('Đăng nhập Facebook thất bại!');
      }
    }, { scope: 'public_profile,email' });
  }, []);

  const handleUserTypeSelect = useCallback(async (userType: 'job_seeker' | 'freelancer' | 'hr') => {
    try {
      if (loginMethod === 'google') {
        await googleLogin(pendingIdToken, userType);
      } else if (loginMethod === 'github') {
        await githubLogin(pendingGitHubCode, userType);
      } else if (loginMethod === 'facebook') {
        await facebookLogin(pendingFacebookToken, userType);
      }
      message.success('Đăng nhập thành công!');
      router.push('/');
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setShowUserTypeModal(false);
      setPendingIdToken('');
      setPendingGitHubCode('');
      setPendingFacebookToken('');
    }
  }, [pendingIdToken, pendingGitHubCode, pendingFacebookToken, loginMethod, googleLogin, githubLogin, facebookLogin, router]);

  const handleModalCancel = useCallback(() => {
    setShowUserTypeModal(false);
    setPendingIdToken('');
    setPendingGitHubCode('');
    setPendingFacebookToken('');
  }, []);

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-indigo-600 font-bold text-3xl">V</span>
              </div>
              <span className="text-3xl font-bold text-white">
                ViệcLàm24h
              </span>
            </Link>
          </div>

          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Kết nối với<br />
              cơ hội nghề nghiệp<br />
              của bạn
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Hàng nghìn công việc đang chờ đón bạn. Đăng nhập ngay để khám phá!
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
                <span className="text-white/90">Tìm việc làm phù hợp với kỹ năng</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
                <span className="text-white/90">Kết nối với nhà tuyển dụng uy tín</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
                <span className="text-white/90">Quản lý CV và hồ sơ chuyên nghiệp</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-white/70 text-sm">
            © 2024 ViệcLàm24h. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">V</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  ViệcLàm<span className="text-indigo-600">24h</span>
                </span>
              </Link>
            </div>

            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h2>
                  <p className="text-gray-600">Đăng nhập để tiếp tục</p>
                </div>

                <div className="space-y-4">
                  {/* Google Login */}
                  <Button
                    size="large"
                    block
                    icon={<GoogleOutlined className="text-xl" />}
                    onClick={handleGoogleLogin}
                    loading={isLoading}
                    className="h-14 font-medium text-base border-2 border-red-300 hover:border-red-600 hover:text-red-600 hover:shadow-lg transition-all"
                  >
                    Đăng nhập với Google
                  </Button>

                  {/* GitHub Login */}
                  <Button
                    size="large"
                    block
                    icon={<GithubOutlined className="text-xl" />}
                    onClick={handleGitHubLogin}
                    loading={isLoading}
                    className="h-14 font-medium text-base border-2 border-gray-300 hover:border-gray-800 hover:text-gray-800 hover:shadow-lg transition-all"
                  >
                    Đăng nhập với GitHub
                  </Button>

                  {/* Facebook Login */}
                  <Button
                    size="large"
                    block
                    icon={<FacebookOutlined className="text-xl" />}
                    onClick={handleFacebookLogin}
                    loading={isLoading}
                    className="h-14 font-medium text-base border-2 border-blue-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all"
                  >
                    Đăng nhập với Facebook
                  </Button>
                </div>

                <div className="mt-8 text-center">
                  <span className="text-gray-600">Chưa có tài khoản? </span>
                  <Link
                    href="/register"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500">
                  Bằng việc đăng nhập, bạn đồng ý với{' '}
                  <Link href="/terms" className="text-indigo-600 hover:underline">
                    Điều khoản
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">
                    Chính sách bảo mật
                  </Link>
                </p>
              </div>
            </Card>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Cần hỗ trợ?{' '}
                <Link href="/support" className="text-indigo-600 hover:underline font-medium">
                  Liên hệ chúng tôi
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserTypeModal
        visible={showUserTypeModal}
        onCancel={handleModalCancel}
        onSelect={handleUserTypeSelect}
        loading={isLoading}
      />
    </>
  );
};
