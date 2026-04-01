import { useState, useEffect } from 'react';
import { Card, message, Button, Space } from 'antd';
import { GithubOutlined, UserOutlined, TeamOutlined, CodeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';


declare global {
  interface Window {
    google?: any;
  }
}

type UserType = 'job_seeker' | 'freelancer' | 'hr';

// Đọc banned message NGAY khi module load, trước cả React render
const bannedMessageOnLoad = (() => {
  if (typeof window === 'undefined') return '';
  const msg = sessionStorage.getItem('bannedMessage');
  if (msg) sessionStorage.removeItem('bannedMessage');
  return msg || '';
})();

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('job_seeker');
  const [bannedMsg, setBannedMsg] = useState(bannedMessageOnLoad);
  const router = useRouter();
  const { googleLogin, githubLogin, isAuthenticated, _hasHydrated } = useAuthStore();

  // Redirect away from login page if already authenticated
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      const redirect = (router.query.redirect as string) || '/';
      router.replace(redirect);
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Hiện message ngay khi component mount (không chờ Zustand rehydrate)
  useEffect(() => {
    if (bannedMsg) {
      message.error(bannedMsg);
      setBannedMsg(''); // clear sau khi show
    }
  }, [bannedMsg]);

  useEffect(() => {
    const code = router.query.code as string;
    if (code && !githubLoading) {
      const savedUserType = localStorage.getItem('pendingUserType') as UserType;
      if (savedUserType) {
        setUserType(savedUserType);
        localStorage.removeItem('pendingUserType');
      }
      handleGithubCallback(code);
    }
  }, [router.query.code]);

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
      router.replace('/login', undefined, { shallow: true });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;
    const scope = 'read:user user:email';
    localStorage.setItem('pendingUserType', userType);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  const handleGoogleLogin = () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    if (typeof window.google !== 'undefined' && window.google.accounts) {
      // Initialize chỉ cần gọi 1 lần — SDK giữ state
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            handleGoogleCallback(response);
          } else {
            setGoogleLoading(false);
            message.error('Không nhận được token từ Google.');
          }
        },
        auto_select: false,
      });

      // prompt() luôn trả FRESH token — không dùng lại token cũ
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Nếu popup bị chặn → fallback dùng renderButton
          const container = document.createElement('div');
          container.style.position = 'fixed';
          container.style.top = '50%';
          container.style.left = '50%';
          container.style.transform = 'translate(-50%,-50%)';
          container.style.zIndex = '9999';
          document.body.appendChild(container);

          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: 300,
          });

          const btn = container.querySelector('[role="button"]') as HTMLElement;
          if (btn) btn.click();

          setTimeout(() => {
            if (container.parentNode) container.parentNode.removeChild(container);
          }, 3000);
          setGoogleLoading(false);
        }
      });
    } else {
      setGoogleLoading(false);
      message.error('Google Sign-In chưa sẵn sàng. Hãy tải lại trang.');
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
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Abstract Background Patterns */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0.4,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        {/* Top Left Shape */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(34,197,94,0.05))',
          filter: 'blur(40px)',
          animation: 'float 20s ease-in-out infinite alternate',
        }} />
        
        {/* Bottom Right Shape */}
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(15,23,42,0.03))',
          filter: 'blur(60px)',
          animation: 'float 25s ease-in-out infinite alternate-reverse',
        }} />

        {/* Pattern Dots Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(22,163,74,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Floating Elements */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 24, height: 24, borderRadius: '50%',
          border: '4px solid rgba(22,163,74,0.15)',
          animation: 'floatY 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%',
          width: 32, height: 32,
          border: '4px solid rgba(22,163,74,0.1)',
          transform: 'rotate(45deg)',
          animation: 'floatY 8s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute', top: '70%', left: '15%',
          width: 16, height: 16, borderRadius: '4px',
          background: 'rgba(22,163,74,0.08)',
          animation: 'floatY 10s ease-in-out infinite'
        }} />
      </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          border: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
        styles={{ body: { padding: '48px 40px' } }}
      >
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: 20 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 10px 20px rgba(22,163,74,0.15)',
                margin: '0 auto',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 28 }}>V</span>
            </div>
          </Link>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>
            Chào mừng trở lại
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Hãy chọn loại tài khoản và phương thức đăng nhập
          </p>
        </div>

        {/* Account Type Selection */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Bạn đăng nhập với tư cách?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { type: 'job_seeker', icon: UserOutlined, label: 'Ứng viên' },
              { type: 'freelancer', icon: CodeOutlined, label: 'Freelancer' },
              { type: 'hr', icon: TeamOutlined, label: 'HR' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => setUserType(item.type as UserType)}
                style={{
                  padding: '16px 8px',
                  borderRadius: 16,
                  border: `2px solid ${userType === item.type ? '#16a34a' : '#f1f5f9'}`,
                  background: userType === item.type ? 'rgba(22,163,74,0.04)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: userType === item.type ? '0 4px 12px rgba(22,163,74,0.15)' : 'none',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: userType === item.type ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#f8fafc',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'background 0.3s',
                }}>
                  <item.icon style={{ color: userType === item.type ? '#fff' : '#64748b', fontSize: 18 }} />
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: userType === item.type ? '#16a34a' : '#475569',
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* OAuth Actions */}
        <Space direction="vertical" size={12} style={{ width: '100%', marginBottom: 32 }}>
          <Button
            size="large"
            block
            onClick={handleGoogleLogin}
            loading={googleLoading}
            style={{
              height: 52,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontWeight: 600,
              fontSize: 15,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </Button>

    
        </Space>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          paddingTop: 24,
          borderTop: '1px solid #f1f5f9',
        }}>
          <Link
            href="/"
            style={{
              color: '#64748b',
              fontWeight: 600,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>
        </div>
      </Card>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(20px, 40px) rotate(5deg) scale(1.05); }
          100% { transform: translate(-10px, -20px) rotate(-3deg) scale(0.95); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
