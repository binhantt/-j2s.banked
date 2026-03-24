import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Layout, Menu, Button, Space, Avatar, Typography, Badge, Input, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  LineChartOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  LogoutOutlined,
  FileTextOutlined,
  TagsOutlined,
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
      { key: 'domains', icon: <TagsOutlined />, label: 'Lĩnh vực' },
      { key: 'blog', icon: <FileTextOutlined />, label: 'Blog' },
      { key: 'chat', icon: <MessageOutlined />, label: 'Chat' },
    ],
    [],
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sider
        width={300}
        trigger={null}
        style={{
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          boxShadow: '4px 0 16px rgba(15,23,42,0.02)',
          zIndex: 40,
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            <div
              style={{
                height: 84,
                display: 'flex',
                alignItems: 'center',
                padding: '0 28px',
                gap: 14,
                flexShrink: 0,
              }}
            >
              {/* Premium Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 8px 16px rgba(22,163,74,0.15)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 38 38" fill="none">
                    <path
                      d="M5 8L13.5 28.5L19 15L24.5 28.5L33 8"
                      stroke="#ffffff"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ color: '#0f172a', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
                    Việc Làm
                  </span>
                  <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
                    24h ADMIN
                  </span>
                </div>
              </div>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Menu: {
                    itemBg: 'transparent',
                    itemColor: '#64748b',
                    itemHoverBg: '#f0fdf4',
                    itemHoverColor: '#16a34a',
                    itemSelectedBg: '#16a34a',
                    itemSelectedColor: '#ffffff',
                    itemMarginInline: 12,
                    itemBorderRadius: 12,
                  },
                },
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={[currentView]}
                items={menuItems}
                onClick={({ key }: { key: string }) => onChangeView(key)}
                style={{
                  borderInlineEnd: 'none',
                  marginTop: 16,
                  background: 'transparent',
                }}
              />
            </ConfigProvider>
          </div>

          <div
            style={{
              padding: '24px',
              borderTop: '1px solid #f1f5f9',
              background: '#fafafa',
              margin: '0 12px 12px',
              borderRadius: 20,
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge dot color="#22c55e" offset={[-4, 40]}>
                  <Avatar 
                    size={48} 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: '#f0fdf4', 
                      color: '#16a34a',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                    }} 
                  />
                </Badge>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#0f172a', fontWeight: 700, fontSize: 15 }}>Quản trị viên</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>Bảng điều khiển</Text>
                </div>
              </div>

              <Button 
                block 
                size="large"
                icon={<LogoutOutlined />} 
                onClick={onLogout}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  color: '#ef4444',
                  border: '1px solid #fee2e2',
                  background: '#ffffff',
                }}
              >
                Đăng xuất
              </Button>
            </Space>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            height: 84,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 4px 12px rgba(15,23,42,0.01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Input
              size="large"
              prefix={<SearchOutlined style={{ color: '#94a3b8', marginRight: 8 }} />}
              placeholder="Tìm kiếm nội dung, người dùng hoặc báo cáo..."
              style={{ 
                maxWidth: 500, 
                borderRadius: 14, 
                background: '#f8fafc',
                border: '1px solid #eef2f7',
                padding: '10px 16px'
              }}
            />
          </div>

          <Space size={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge count={5} size="small" offset={[-5, 5]}>
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<BellOutlined style={{ fontSize: 20, color: '#64748b' }} />} 
                  style={{ width: 44, height: 44 }}
                />
              </Badge>
            </div>
            
            <div style={{ width: '1px', height: 24, background: '#e2e8f0' }} />

            {currentView === 'blog' && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                style={{
                  height: 48,
                  padding: '0 24px',
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  boxShadow: '0 8px 16px rgba(22,163,74,0.2)',
                }}
                onClick={() => onCreateClick?.('blogCreate')}
              >
                Bài viết mới
              </Button>
            )}
          </Space>
        </Header>

        <Content style={{ padding: '32px', background: '#f8fafc' }}>
          <div style={{ 
            minHeight: 'calc(100vh - 148px)',
            background: '#ffffff',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
