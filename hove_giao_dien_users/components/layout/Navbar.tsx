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
  const [savedItemsCount, setSavedItemsCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('User authenticated, loading notifications for userId:', user.id);
      loadUnreadCount();
      loadNotifications();
      loadSavedItemsCount();
      
      // Poll for new notifications every 2 minutes (reduced from 30 seconds to avoid rate limit)
      const interval = setInterval(() => {
        loadUnreadCount();
        loadNotifications();
        loadSavedItemsCount();
      }, 120000); // 2 minutes
      
      return () => clearInterval(interval);
    } else {
      console.log('User not authenticated or no userId');
    }
  }, [isAuthenticated, user?.id]);

  const loadSavedItemsCount = async () => {
    if (!user?.id) return;
    try {
      const [companiesRes, jobsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/saved-companies/user/${user.id}`),
        fetch(`http://localhost:8080/api/saved-jobs/user/${user.id}`)
      ]);
      
      let total = 0;
      if (companiesRes.ok) {
        const companies = await companiesRes.json();
        total += companies.length;
      }
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        total += jobs.length;
      }
      
      setSavedItemsCount(total);
    } catch (error) {
      console.error('Error loading saved items count:', error);
      setSavedItemsCount(0);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      console.log('Loading unread count for userId:', user.id);
      const count = await notificationApi.getUnreadCount(user.id);
      console.log('Unread count:', count);
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Error loading unread count:', error);
      
      // If rate limited (429), stop polling temporarily
      if (error.response?.status === 429) {
        console.warn('Rate limited - will retry later');
      }
      
      // Silently fail - don't show error to user
      setUnreadCount(0);
    }
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      console.log('Loading notifications for userId:', user.id);
      const data = await notificationApi.getUnreadNotifications(user.id);
      console.log('Notifications loaded:', data);
      setNotifications(data.slice(0, 5)); // Show only 5 most recent
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      
      // If rate limited (429), stop polling temporarily
      if (error.response?.status === 429) {
        console.warn('Rate limited - will retry later');
      }
      
      // Silently fail - don't show error to user
      setNotifications([]);
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
      key: 'settings', 
      label: 'Cài đặt tài khoản',
      onClick: () => router.push('/settings/profile')
    },
    { 
      key: '2', 
      label: 'Tạo CV Online',
      icon: <FileTextOutlined />,
      onClick: () => router.push('/cv-builder')
    },
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
    <Header className="bg-white border-b border-gray-100 flex items-center justify-between fixed w-full z-50 h-16 shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              ViệcLàm24h
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`text-base font-medium transition-colors ${
                router.pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/jobs"
              className={`text-base font-medium transition-colors ${
                router.pathname === '/jobs'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Tìm việc làm
            </Link>
            <Link
              href="/freelance"
              className={`text-base font-medium transition-colors ${
                router.pathname === '/freelance'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Freelance
            </Link>
            <Link
              href="/companies"
              className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Công ty
            </Link>
            {isAuthenticated && (
              <Link
                href="/saved-items"
                className={`text-base font-medium transition-colors flex items-center gap-1 ${
                  router.pathname === '/saved-items'
                    ? 'text-blue-600'
                    : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Thư mục lưu
                {savedItemsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                    {savedItemsCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              href="/blog"
              className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Blog
            </Link>
            {isAuthenticated && (
              <Link
                href="/chat"
                className={`text-base font-medium transition-colors ${
                  router.pathname === '/chat'
                    ? ''
                    : 'text-gray-900 hover:text-blue-600'
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
                type="primary"
                size="large"
                className="font-medium"
                onClick={() => router.push('/login')}
              >
                Đăng nhập
              </Button>
            </div>
          ) : (
            /* Show Avatar and Notifications when authenticated */
            <>
              <Dropdown
                dropdownRender={() => <div>{notificationContent}</div>}
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
                  src={user?.avatarUrl}
                  icon={!user?.avatarUrl && <UserOutlined />}
                  className="bg-indigo-600 cursor-pointer"
                  size={40}
                />
              </Dropdown>
            </>
          )}
        </div>
      </div>
    </Header>
  );
};
