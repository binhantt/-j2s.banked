import { ConfigProvider, message } from 'antd';
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
  const initAuth = useAuthStore((state) => state.initAuth);
  const checkBannedStatus = useAuthStore((state) => state.checkBannedStatus);
  const [bannedMsg, setBannedMsg] = useState(bannedMessageOnLoad);

  useEffect(() => {
    // Initialize auth from localStorage
    initAuth();

    // Configure message globally
    message.config({
      top: 100,
      duration: 3,
      maxCount: 3,
    });
  }, [initAuth]);

  // Hiện message ngay khi app mount (không chờ Zustand rehydrate)
  useEffect(() => {
    if (bannedMsg) {
      message.error(bannedMsg);
      setBannedMsg(''); // clear sau khi show
    }
  }, [bannedMsg]);

  // Check banned status for authenticated users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkBannedStatus();
    }
  }, [checkBannedStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <Component {...pageProps} />
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
