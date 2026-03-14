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
  LogoutOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';

type HeaderCreateTarget = 'none' | 'blogCreate';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  onCreateClick?: (target: HeaderCreateTarget) => void;
}

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AdminLayout({
  children,
  currentView,
  onChangeView,
  onLogout,
  onCreateClick,
}: Readonly<AdminLayoutProps>) {
  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Bảng điều khiển' },
      { key: 'users', icon: <TeamOutlined />, label: 'Người dùng' },
      { key: 'blog', icon: <FileTextOutlined />, label: 'Blog' },
      { key: 'chat', icon: <MessageOutlined />, label: 'Chat' },
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
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
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
                flexShrink: 0,
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
              flexShrink: 0,
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Space>
                <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#16a34a' }} />
                <Space direction="vertical" size={0}>
                  <Text style={{ color: '#f8fafc', fontWeight: 700 }}>Quản trị viên</Text>
                  <Text style={{ color: '#8ea4c8', fontSize: 14 }}>admin@company.vn</Text>
                </Space>
              </Space>

              <Button block icon={<LogoutOutlined />} onClick={onLogout}>
                Thoát
              </Button>
            </Space>
          </div>
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
            position: 'sticky',
            top: 0,
            zIndex: 30,
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
            {currentView === 'blog' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  borderRadius: 12,
                  border: 'none',
                  fontWeight: 600,
                  background: '#16a34a',
                }}
                onClick={() => onCreateClick?.('blogCreate')}
              >
                + Bài viết mới
              </Button>
            )}
          </Space>
        </Header>

        <Content style={{ padding: 20 }}>
          <div style={{ minHeight: 'calc(100vh - 116px)' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
