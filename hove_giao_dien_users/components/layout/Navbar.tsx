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
  MessageOutlined,
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
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [savedItemsCount, setSavedItemsCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUnreadCount();
      loadNotifications();
      loadSavedItemsCount();

      // Poll nhanh hon (5 giay) de phat hien thong bao moi kip thoi
      const interval = setInterval(() => {
        loadUnreadCount();
        loadNotifications();
        loadSavedItemsCount();
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setSavedItemsCount(0);
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
      setSavedItemsCount(0);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      // Lay tong hop thong bao + tin nhan chua doc cho navbar
      const navbarData = await notificationApi.getNavbarCount(user.id);
      setUnreadCount(navbarData.notificationCount);
      setChatUnreadCount(navbarData.chatCount);
    } catch {
      setUnreadCount(0);
      setChatUnreadCount(0);
    }
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await notificationApi.getUnreadNotifications(user.id);
      setNotifications(data.slice(0, 5));
    } catch {
      setNotifications([]);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await notificationApi.markAsRead(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      loadUnreadCount();
      loadNotifications();

      if (notification.relatedEntityType === 'job_application') {
        router.push('/applications/my-applications');
      } else if (notification.type === 'new_message' && notification.relatedEntityType === 'chat_conversation') {
        router.push('/chat');
      }

      setNotificationOpen(false);
    } catch {
      // silent fail
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationApi.markAllAsRead(user.id);
      loadUnreadCount();
      loadNotifications();
    } catch {
      // silent fail
    }
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: '#0b1220', fontSize: 15 }}>Thông báo</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead} style={{ color: '#16a34a', fontSize: 12 }}>
            Đánh dấu đã đọc tất cả
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
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
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#16a34a' }} />
                  ) : item.type === 'application_rejected' ? (
                    <CloseCircleOutlined style={{ fontSize: 24, color: '#ef4444' }} />
                  ) : item.type === 'new_message' ? (
                    <MessageOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                  ) : (
                    <BellOutlined style={{ fontSize: 24, color: '#16a34a' }} />
                  )
                }
                title={<span style={{ fontWeight: 500, color: '#0b1220' }}>{item.title}</span>}
                description={
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
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
          <Button
            type="link"
            onClick={() => { setNotificationOpen(false); router.push('/applications/my-applications'); }}
            style={{ color: '#16a34a', fontSize: 13 }}
          >
            Xem tất cả thông báo
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
    { key: '/', icon: <HomeOutlined />, label: 'Trang chủ', onClick: () => router.push('/') },
    { key: '/jobs', icon: <SearchOutlined />, label: 'Tìm việc làm', onClick: () => router.push('/jobs') },
    { key: '/saved-items', icon: <HeartOutlined />, label: 'Thư mục đã lưu', onClick: () => router.push('/saved-items') },
    { key: '/blog', icon: <FileTextOutlined />, label: 'Blog', onClick: () => router.push('/blog') },
  ];

  return (
    <Header
      style={{
        background: '#0b1220',
        borderBottom: '1px solid rgba(22,163,74,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        width: '100%',
        zIndex: 50,
        height: 72,
        padding: '0 24px',
        lineHeight: '72px',
      }}
    >
      <div style={{ maxWidth: 1280, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>V</span>
          </div>
          <span style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#f8fafc',
            display: 'none',
          }}
            className="logo-text"
          >
            ViệcLàm24h
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {[
            { href: '/', label: 'Trang chủ' },
            { href: '/jobs', label: 'Tìm việc làm' },
            { href: '/freelance', label: 'Freelance' },
            { href: '/companies', label: 'Công ty' },
            { href: '/blog', label: 'Blog' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: '#94a3b8',
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/saved-items"
              style={{
                color: '#94a3b8',
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Thư mục đã lưu
              {savedItemsCount > 0 && (
                <span style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  background: '#16a34a',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {savedItemsCount}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/chat"
              style={{
                color: '#94a3b8',
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MessageOutlined style={{ fontSize: 14 }} />
              Tin nhắn
              {chatUnreadCount > 0 && (
                <span style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mobile Menu */}
          <div className="mobile-menu">
            <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight">
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18, color: '#f8fafc' }} />}
                style={{ width: 40, height: 40 }}
              />
            </Dropdown>
          </div>

          {/* Not authenticated - Login button */}
          {!isAuthenticated ? (
            <Button
              type="primary"
              size="large"
              onClick={() => router.push('/login')}
              style={{
                height: 40,
                borderRadius: 10,
                background: '#16a34a',
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              Đăng nhập
            </Button>
          ) : (
            <>
              {/* Notifications */}
              <Dropdown
                dropdownRender={() => notificationContent}
                trigger={['click']}
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
              >
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 18, color: '#94a3b8' }} />}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Badge>
              </Dropdown>

              {/* User Avatar */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  src={user?.avatarUrl}
                  icon={!user?.avatarUrl && <UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                  }}
                  size={40}
                />
              </Dropdown>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .logo-text { display: block !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu { display: flex !important; }
        }
        .desktop-nav a:hover {
          color: #16a34a !important;
        }
      `}</style>
    </Header>
  );
};
