// theme/themeConfig.ts - Giao diện nhỏ gọn, đẹp
import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // Colors - 3 màu xanh chính
    fontSize: 14,
    colorPrimary: '#3b82f6',      // Blue
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#06b6d4',         // Cyan
    
    // Border & Radius - Nhỏ gọn hơn
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Spacing - Compact
    padding: 12,
    paddingLG: 16,
    paddingSM: 8,
    margin: 12,
    marginLG: 16,
    marginSM: 8,
    
    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSizeHeading1: 28,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    fontWeightStrong: 600,
    
    // Background
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f9fafb',
    colorBgElevated: '#ffffff',
    
    // Border
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',
    
    // Shadow - Nhẹ hơn
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    boxShadowSecondary: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Control - Nhỏ gọn
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      bodyBg: '#f9fafb',
    },
    Button: {
      primaryColor: '#ffffff',
      colorPrimary: '#3b82f6',    // Blue
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
      paddingContentHorizontal: 16,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingBlock: 8,
      paddingInline: 12,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 8,
      borderRadiusLG: 12,
      paddingLG: 20,
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    Modal: {
      borderRadius: 8,
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Tabs: {
      itemActiveColor: '#3b82f6',    // Blue
      itemHoverColor: '#60a5fa',     // Blue light
      itemSelectedColor: '#3b82f6',  // Blue
      inkBarColor: '#3b82f6',        // Blue
    },
    Avatar: {
      containerSize: 40,
      containerSizeLG: 64,
      containerSizeSM: 32,
    },
  },
};

export default theme;