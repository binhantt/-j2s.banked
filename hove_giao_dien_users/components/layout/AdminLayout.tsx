import { ReactNode, useMemo, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  BankOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface AdminLayoutProps {
  children: ReactNode;
}

const ADMIN_MENU_ITEMS: MenuProps['items'] = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/users', icon: <TeamOutlined />, label: 'Người dùng' },
  { key: '/admin/jobs', icon: <SolutionOutlined />, label: 'Tin tuyển dụng' },
  { key: '/admin/companies', icon: <BankOutlined />, label: 'Công ty' },
  { key: '/admin/reports', icon: <FileTextOutlined />, label: 'Báo cáo' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    const pathname = router.pathname;
    const matched = ADMIN_MENU_ITEMS?.find((item) => {
      if (!item || typeof item !== 'object' || !('key' in item)) return false;
      return pathname === item.key || pathname.startsWith(`${item.key}/`);
    });
    return matched && typeof matched === 'object' && 'key' in matched ? [String(matched.key)] : ['/admin'];
  }, [router.pathname]);

  const profileItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin admin' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
  ];

  const isMobile = !screens.lg;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 84}
        trigger={null}
        width={250}
        style={{
          background: '#0f172a',
          borderRight: '1px solid rgba(148, 163, 184, 0.15)',
          boxShadow: '8px 0 24px rgba(2, 6, 23, 0.24)',
        }}
      >
        <div
          style={{
            padding: collapsed ? '16px 12px' : '16px 20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#e2e8f0',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 0.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? 'TV24' : 'Admin Tìm Việc 24h'}
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKey}
          items={ADMIN_MENU_ITEMS}
          onClick={({ key }) => router.push(key)}
          style={{
            marginTop: 10,
            borderInlineEnd: 'none',
            background: 'transparent',
            color: '#cbd5e1',
          }}
          theme="dark"
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#ffffff',
            height: 64,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Space size={10}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <div>
              <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
                Quản trị hệ thống
              </Text>
              <div style={{ fontSize: 12, color: '#64748b' }}>Nền tảng tuyển dụng Tìm Việc 24h</div>
            </div>
          </Space>

          <Space size={16}>
            <Button shape="circle" icon={<BellOutlined />} />
            <Dropdown menu={{ items: profileItems }} trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2563eb' }} />
                <Text strong>Admin</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 20 }}>
          <div
            style={{
              minHeight: 'calc(100vh - 104px)',
              borderRadius: 16,
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
              border: '1px solid #e6edf7',
              padding: 20,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

