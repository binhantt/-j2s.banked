import { Layout, Button, Avatar, Badge, Dropdown, List } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  HomeOutlined,
  SearchOutlined,
  FileTextOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { notificationApi, Notification } from '@/lib/notificationApi';

const { Header } = Layout;

export const Navbar = () => {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('User authenticated, loading notifications for userId:', user.id);
      loadUnreadCount();
      loadNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
        loadNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.log('User not authenticated or no userId');
    }
  }, [isAuthenticated, user?.id]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      console.log('Loading unread count for userId:', user.id);
      const count = await notificationApi.getUnreadCount(user.id);
      console.log('Unread count:', count);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Error loading unread count:', error);
      console.error('Error response:', error.response);
      // Don't show error to user, just log it
      if (error.response?.status === 404) {
        console.log('Notifications table may not exist yet');
      }
    }
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      console.log('Loading notifications for userId:', user.id);
      const data = await notificationApi.getUnreadNotifications(user.id);
      console.log('Notifications loaded:', data);
      console.log('Setting notifications state with', data.length, 'items');
      setNotifications(data.slice(0, 5)); // Show only 5 most recent
      console.log('Notifications state updated');
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      console.error('Error response:', error.response);
      // Don't show error to user, just log it
      if (error.response?.status === 404) {
        console.log('Notifications table may not exist yet');
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await notificationApi.markAsRead(notification.id);
      loadUnreadCount();
      loadNotifications();
      
      // Navigate based on notification type
      if (notification.relatedEntityType === 'job_application') {
        router.push('/applications/my-applications');
      }
      
      setNotificationOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationApi.markAllAsRead(user.id);
      loadUnreadCount();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
      {console.log('Rendering notification dropdown, notifications:', notifications, 'count:', unreadCount)}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>Thông báo</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead}>
            Đánh dấu đã đọc tất cả
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          Không có thông báo mới
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '12px 16px' }}
              onClick={() => handleNotificationClick(item)}
            >
              <List.Item.Meta
                avatar={
                  item.type === 'application_accepted' ? (
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  ) : item.type === 'application_rejected' ? (
                    <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                  ) : (
                    <BellOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  )
                }
                title={<span style={{ fontWeight: 500 }}>{item.title}</span>}
                description={
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      {notifications.length > 0 && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <Button type="link" onClick={() => { setNotificationOpen(false); router.push('/applications/my-applications'); }}>
            Xem tất cả
          </Button>
        </div>
      )}
    </div>
  );

  const userMenuItems: MenuProps['items'] = [
    { 
      key: '1', 
      label: 'Hồ sơ của tôi',
      onClick: () => router.push('/profile')
    },
    { 
      key: '2', 
      label: 'Tạo CV Online',
      icon: <FileTextOutlined />,
      onClick: () => router.push('/cv-builder')
    },
    ...(user?.userType === 'hr' ? [
      { 
        key: 'hr-blogs', 
        label: ' Quản lý Blog',
        onClick: () => router.push('/company/blogs')
      },
      { 
        key: 'hr-jobs', 
        label: '💼 Quản lý Tin tuyển dụng',
        onClick: () => router.push('/jobs/my-jobs')
      },
    ] : []),
    { key: '3', label: 'Cài đặt' },
    { type: 'divider' },
    { key: '4', label: 'Đăng xuất', danger: true, onClick: logout },
  ];

  const mobileMenuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
      onClick: () => router.push('/'),
    },
    {
      key: '/jobs',
      icon: <SearchOutlined />,
      label: 'Tìm việc làm',
      onClick: () => router.push('/jobs'),
    },
    {
      key: '/saved',
      icon: <HeartOutlined />,
      label: 'Việc đã lưu',
    },
    {
      key: '/resume',
      icon: <FileTextOutlined />,
      label: 'Hồ sơ',
    },
  ];

  return (
    <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between fixed w-full z-50 h-16 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <span className="text-2xl font-bold text-gray-800 hidden sm:block">
            ViệcLàm<span className="text-indigo-600">24h</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/"
            className={`text-base font-medium transition-colors ${
              router.pathname === '/'
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Trang chủ
          </Link>
          <Link
            href="/jobs"
            className={`text-base font-medium transition-colors ${
              router.pathname === '/jobs'
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Tìm việc làm
          </Link>
          <Link
            href="/freelance"
            className={`text-base font-medium transition-colors ${
              router.pathname === '/freelance'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Freelance
          </Link>
          <Link
            href="/companies"
            className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Công ty
          </Link>
          <Link
            href="/blog"
            className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Blog
          </Link>
          {isAuthenticated && (
            <Link
              href="/chat"
              className={`text-base font-medium transition-colors ${
                router.pathname === '/chat'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Tin nhắn
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Dropdown
          menu={{ items: mobileMenuItems }}
          placement="bottomRight"
          className="lg:hidden"
        >
          <Button type="text" icon={<MenuOutlined className="text-lg" />} />
        </Dropdown>

        {/* Show Login/Register buttons when NOT authenticated */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button
              type="default"
              size="large"
              className="font-medium"
              onClick={() => router.push('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              size="large"
              className="font-medium hidden sm:inline-block"
              onClick={() => router.push('/register')}
            >
              Đăng ký
            </Button>
          </div>
        ) : (
          /* Show Avatar and Notifications when authenticated */
          <>
            <Dropdown
              dropdownRender={() => notificationContent}
              trigger={['click']}
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
            >
              <Badge count={unreadCount} size="small" className="hidden sm:inline-block">
                <Button
                  type="text"
                  icon={<BellOutlined className="text-lg" />}
                  className="hover:bg-gray-50 rounded-full w-10 h-10"
                />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                icon={<UserOutlined />}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 cursor-pointer"
                size="large"
              />
            </Dropdown>
          </>
        )}
      </div>
    </Header>
  );
};
