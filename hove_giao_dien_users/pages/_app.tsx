import { ConfigProvider, message } from 'antd';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/profile.css';
import theme from '../theme/themeConfig';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const App = ({ Component, pageProps }: AppProps) => {
  const initAuth = useAuthStore((state) => state.initAuth);

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

  return (
    <ConfigProvider theme={theme}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
};

export default App;
