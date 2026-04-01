import { ConfigProvider, message } from 'antd';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/profile.css';
import theme from '../theme/themeConfig';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Đọc banned message NGAY khi module load, trước cả React render
const bannedMessageOnLoad = (() => {
  if (typeof window === 'undefined') return '';
  const msg = sessionStorage.getItem('bannedMessage');
  if (msg) sessionStorage.removeItem('bannedMessage');
  return msg || '';
})();

const App = ({ Component, pageProps }: AppProps) => {
  const initAuth        = useAuthStore((state) => state.initAuth);
  const checkBannedStatus = useAuthStore((state) => state.checkBannedStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [bannedMsg, setBannedMsg] = useState(bannedMessageOnLoad);

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
