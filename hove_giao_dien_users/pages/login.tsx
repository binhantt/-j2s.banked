import { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { GithubOutlined, UserOutlined, TeamOutlined, CodeOutlined, LockOutlined } from '@ant-design/icons';
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
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

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

        setTimeout(() => {
          const googleButton = buttonDiv.querySelector('div[role="button"]') as HTMLElement;
          if (googleButton) {
            googleButton.click();
          } else {
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                setGoogleLoading(false);
                message.info('Vui lòng click lại nút Google để đăng nhập');
              }
            });
          }
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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0b1220 0%, #0f172a 45%, #16a34a 220%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Decorative glow left */}
      <div style={{
        position: 'fixed', top: '20%', left: '-10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Decorative glow right */}
      <div style={{
        position: 'fixed', bottom: '10%', right: '-5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(22,163,74,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 16,
          border: '1px solid rgba(22,163,74,0.25)',
          boxShadow: '0 24px 48px rgba(2, 6, 23, 0.4), 0 0 0 1px rgba(22,163,74,0.1)',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(20px)',
        }}
        styles={{ body: { padding: '40px 36px' } }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              margin: '0 auto 16px',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 8px 20px rgba(22,163,74,0.35)',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>V</span>
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: 6,
          }}>
            ViệcLàm24h
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Đăng nhập để tiếp tục
          </p>
        </div>

        {/* User Type Selection */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
            textAlign: 'center',
          }}>
            Chọn loại tài khoản
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              onClick={() => setUserType('job_seeker')}
              style={{
                padding: '12px 8px',
                borderRadius: 10,
                border: `2px solid ${userType === 'job_seeker' ? '#16a34a' : '#1e293b'}`,
                background: userType === 'job_seeker' ? 'rgba(22,163,74,0.12)' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: userType === 'job_seeker' ? '#16a34a' : '#1e293b',
                display: 'grid',
                placeItems: 'center',
              }}>
                <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: userType === 'job_seeker' ? '#16a34a' : '#64748b',
              }}>
                Ứng viên
              </span>
            </button>

            <button
              onClick={() => setUserType('freelancer')}
              style={{
                padding: '12px 8px',
                borderRadius: 10,
                border: `2px solid ${userType === 'freelancer' ? '#16a34a' : '#1e293b'}`,
                background: userType === 'freelancer' ? 'rgba(22,163,74,0.12)' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: userType === 'freelancer' ? '#16a34a' : '#1e293b',
                display: 'grid',
                placeItems: 'center',
              }}>
                <CodeOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: userType === 'freelancer' ? '#16a34a' : '#64748b',
              }}>
                Freelancer
              </span>
            </button>

            <button
              onClick={() => setUserType('hr')}
              style={{
                padding: '12px 8px',
                borderRadius: 10,
                border: `2px solid ${userType === 'hr' ? '#16a34a' : '#1e293b'}`,
                background: userType === 'hr' ? 'rgba(22,163,74,0.12)' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: userType === 'hr' ? '#16a34a' : '#1e293b',
                display: 'grid',
                placeItems: 'center',
              }}>
                <TeamOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: userType === 'hr' ? '#16a34a' : '#64748b',
              }}>
                Nhà tuyển dụng
              </span>
            </button>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              height: 48,
              borderRadius: 10,
              border: '1.5px solid #1e293b',
              background: '#0f172a',
              color: '#f1f5f9',
              fontWeight: 600,
              fontSize: 14,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              opacity: googleLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
            }}
          >
            {googleLoading ? (
              <div style={{
                width: 20, height: 20,
                border: '2px solid #475569',
                borderTopColor: '#16a34a',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Tiếp tục với Google</span>
              </>
            )}
          </button>

          <button
            onClick={handleGithubLogin}
            disabled={githubLoading}
            style={{
              height: 48,
              borderRadius: 10,
              border: '1.5px solid #1e293b',
              background: '#0f172a',
              color: '#f1f5f9',
              fontWeight: 600,
              fontSize: 14,
              cursor: githubLoading ? 'not-allowed' : 'pointer',
              opacity: githubLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
            }}
          >
            {githubLoading ? (
              <div style={{
                width: 20, height: 20,
                border: '2px solid #475569',
                borderTopColor: '#16a34a',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <>
                <GithubOutlined style={{ fontSize: 20, color: '#f1f5f9' }} />
                <span>Tiếp tục với GitHub</span>
              </>
            )}
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid #1e293b',
        }}>
          <Link
            href="/"
            style={{
              color: '#16a34a',
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </Card>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
