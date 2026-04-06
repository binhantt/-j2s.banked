import { ConfigProvider, message } from 'antd';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/profile.css';
import theme from '../theme/themeConfig';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useRouter } from 'next/router';
import {
  getUserAntiDebugFingerprint,
  getUserAntiDebugStatus,
  reportUserAntiDebugEvent,
} from '@/lib/antiDebug';

// Đọc banned message NGAY khi module load, trước cả React render
const bannedMessageOnLoad = (() => {
  if (typeof window === 'undefined') return '';
  const msg = sessionStorage.getItem('bannedMessage');
  if (msg) sessionStorage.removeItem('bannedMessage');
  return msg || '';
})();

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const initAuth        = useAuthStore((state) => state.initAuth);
  const logout          = useAuthStore((state) => state.logout);
  const checkBannedStatus = useAuthStore((state) => state.checkBannedStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [bannedMsg, setBannedMsg] = useState(bannedMessageOnLoad);
  const devtoolsLockedRef = useRef(false);

  const clearSensitiveClientData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (!key) {
        continue;
      }

      if (key.startsWith('cv_access_token_') || key.startsWith('cv_token_used_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  };

  const isSensitiveRoute = (pathname: string) => {
    const sensitivePrefixes = [
      '/profile',
      '/chat',
      '/cv-builder',
      '/my-applications',
      '/saved-items',
    ];

    return sensitivePrefixes.some((prefix) => pathname.startsWith(prefix));
  };

  // Chạy 1 lần duy nhất khi app mount
  useEffect(() => {
    initAuth();
    message.config({
      top: 100,
      duration: 3,
      maxCount: 3,
    });
  }, [initAuth]);

  // Hiện banned message ngay khi mount (không chờ Zustand rehydrate)
  useEffect(() => {
    if (bannedMsg) {
      message.error(bannedMsg);
      setBannedMsg('');
    }
  }, [bannedMsg]);

  // Check banned: CHỈ khi có token (isAuthenticated thay đổi → user login/logout)
  useEffect(() => {
    if (isAuthenticated) {
      checkBannedStatus();
    }
  }, [isAuthenticated, checkBannedStatus]);

  useEffect(() => {
    const antiDebugEnabled =
      process.env.NEXT_PUBLIC_ENABLE_ANTI_DEBUG === 'true' ||
      process.env.NODE_ENV === 'production';

    if (!antiDebugEnabled) {
      return;
    }

    if (!isAuthenticated || !isSensitiveRoute(router.pathname)) {
      return;
    }

    const fingerprint = getUserAntiDebugFingerprint();

    const forceLogoutForDevtools = async (eventName: string, lockSeconds: number = 0) => {
      if (devtoolsLockedRef.current) {
        return;
      }
      devtoolsLockedRef.current = true;

      try {
        await reportUserAntiDebugEvent(router.pathname, eventName, fingerprint);
      } catch {
        // Ignore logging failures to ensure immediate logout behavior.
      }

      clearSensitiveClientData();
      logout();
      const minuteText = lockSeconds > 0 ? ` He thong khoa tam thoi ${Math.ceil(lockSeconds / 60)} phut.` : '';
      sessionStorage.setItem('bannedMessage', `Phat hien cong cu devtools. He thong da dang xuat de bao ve du lieu.${minuteText}`);
      void router.replace('/login');
    };

    void (async () => {
      try {
        const status = await getUserAntiDebugStatus(fingerprint);
        if (status.locked) {
          await forceLogoutForDevtools('locked_status', status.lockRemainingSeconds);
        }
      } catch {
        // Keep UX unchanged if status API is unavailable.
      }
    })();

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blockedShortcut =
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (event.ctrlKey && key === 'u');

      if (!blockedShortcut) {
        return;
      }

      event.preventDefault();
      void forceLogoutForDevtools('blocked_shortcut');
    };

    const detectDevtoolsOpen = () => {
      const threshold = 160;
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      const isDevtoolsOpen = widthGap > threshold || heightGap > threshold;

      if (isDevtoolsOpen) {
        void forceLogoutForDevtools('devtools_open');
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      void forceLogoutForDevtools('context_menu');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('contextmenu', onContextMenu);
    const intervalId = window.setInterval(detectDevtoolsOpen, 1000);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('contextmenu', onContextMenu);
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, logout, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <Head>
          <title>Hove - Tuyển dụng & Việc làm trực tuyến</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <Component {...pageProps} />
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
