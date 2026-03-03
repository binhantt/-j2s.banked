import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Layout, Menu, Button, Space, Avatar, Typography, Badge, Input, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  LineChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
}

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AdminLayout({ children, currentView, onChangeView }: AdminLayoutProps) {
  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Bảng điều khiển' },
      { key: 'users', icon: <TeamOutlined />, label: 'Người dùng' },
      { key: 'analytics', icon: <LineChartOutlined />, label: 'Phân tích' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    ],
    [],
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f3f6fb' }}>
      <Sider
        width={300}
        trigger={null}
        style={{
          background: 'linear-gradient(180deg, #0b1220 0%, #0a1530 100%)',
          borderRight: '1px solid rgba(148,163,184,0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              height: 84,
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 40,
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#16a34a',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 38 }}>AdminPro</span>
          </div>

          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  darkItemBg: 'transparent',
                  darkItemColor: '#9fb2cf',
                  darkItemHoverBg: 'rgba(22,163,74,0.14)',
                  darkItemSelectedBg: '#16a34a',
                  darkItemSelectedColor: '#ffffff',
                },
              },
            }}
          >
            <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[currentView]}
              items={menuItems}
              onClick={({ key }: { key: string }) => onChangeView(key)}
              style={{
                borderInlineEnd: 'none',
                marginTop: 8,
                background: 'transparent',
                paddingInline: 12,
              }}
            />
          </ConfigProvider>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(148,163,184,0.22)',
            padding: '18px 20px',
            marginTop: 20,
          }}
        >
          <Space>
            <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#16a34a' }} />
            <Space direction="vertical" size={0}>
              <Text style={{ color: '#f8fafc', fontWeight: 700 }}>Quản trị viên</Text>
              <Text style={{ color: '#8ea4c8', fontSize: 14 }}>admin@company.vn</Text>
            </Space>
          </Space>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            height: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f3f6fb',
            borderBottom: '1px solid #dde5ef',
            padding: '0 24px',
          }}
        >
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm nội dung..."
            style={{ maxWidth: 600, borderRadius: 12, background: '#eef2f7' }}
          />

          <Space size={14}>
            <Badge dot>
              <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: 12,
                border: 'none',
                fontWeight: 600,
                background: '#16a34a',
              }}
            >
              + Tạo mới
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: 20 }}>
          <div style={{ minHeight: 'calc(100vh - 116px)' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
