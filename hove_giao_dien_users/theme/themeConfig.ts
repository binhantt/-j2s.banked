// theme/themeConfig.ts - Đồng bộ màu xanh lá với admin (#16a34a)
import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // Colors - Đồng bộ với admin theme
    fontSize: 14,
    colorPrimary: '#16a34a',      // Green - Đồng bộ với admin
    colorSuccess: '#16a34a',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#16a34a',         // Green

    // Border & Radius - Nhỏ gọn hơn
    borderRadius: 10,
    borderRadiusLG: 14,
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
    colorBgLayout: '#f3f6fb',
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
      headerHeight: 76,
      headerPadding: '0 24px',
      bodyBg: '#f3f6fb',
    },
    Button: {
      primaryColor: '#ffffff',
      colorPrimary: '#16a34a',    // Green - Đồng bộ với admin
      borderRadius: 10,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 600,
      paddingContentHorizontal: 16,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40,
      paddingBlock: 8,
      paddingInline: 12,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 14,
      borderRadiusLG: 14,
      paddingLG: 20,
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    Modal: {
      borderRadius: 14,
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Tabs: {
      itemActiveColor: '#16a34a',
      itemHoverColor: '#22c55e',
      itemSelectedColor: '#16a34a',
      inkBarColor: '#16a34a',
    },
    Avatar: {
      containerSize: 40,
      containerSizeLG: 64,
      containerSizeSM: 32,
    },
  },
};

export default theme;
