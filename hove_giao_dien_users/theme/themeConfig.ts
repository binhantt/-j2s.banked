// theme/themeConfig.ts
import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 14,
    colorPrimary: '#4f46e5',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#4f46e5',
    borderRadius: 8,
    colorBgContainer: '#ffffff',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#1a1f2e',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: '#2563eb',
      darkItemHoverBg: 'rgba(37, 99, 235, 0.3)',
      itemMarginInline: 8,
    },
    Button: {
      primaryColor: '#ffffff',
      colorPrimary: '#4f46e5',
      algorithm: true,
    },
  },
};

export default theme;