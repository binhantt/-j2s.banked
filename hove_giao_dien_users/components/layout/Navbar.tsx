import { Layout, Button, Avatar, Badge, Dropdown, List, Typography } from 'antd';
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
import { useState } from 'react';
import { notificationApi, Notification } from '@/lib/notificationApi';
import { savedJobApi } from '@/lib/savedJobApi';
import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

const { Header } = Layout;
const { Text } = Typography;

// ──────────────────────────────────────────────────────────────
// HELPER: Notification icon theo type
// ──────────────────────────────────────────────────────────────
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'application_accepted':
      return <CheckCircleOutlined style={{ fontSize: 24, color: '#16a34a' }} />;
    case 'application_rejected':
      return <CloseCircleOutlined style={{ fontSize: 24, color: '#ef4444' }} />;
    case 'new_message':
      return <MessageOutlined style={{ fontSize: 24, color: '#3b82f6' }} />;
    default:
      return <BellOutlined style={{ fontSize: 24, color: '#16a34a' }} />;
  }
};

export const Navbar = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, logout, user, _hasHydrated } = useAuthStore();
  const [notificationOpen, setNotificationOpen] = useState(false);

  // ──────────────────────────────────────────────────────────────
  // REACT QUERY: Lấy số lượng thông báo + chat chưa đọc
  // ──────────────────────────────────────────────────────────────
  // Thay setInterval 5s → refetchInterval 60s
  // Hiệu năng: 1 req/phút thay vì 12 req/phút (5s × 12 = 60s)
  // Nếu 50K users × 12 req/min = 600K req/h → giảm còn 50K req/h
  const {
    data: navbarCount = { notificationCount: 0, chatCount: 0, total: 0 },
  } = useQuery({
    queryKey: queryKeys.notifications.navbar(user?.id ?? 0),
    queryFn: () => notificationApi.getNavbarCount(user!.id),
    // Chỉ fetch khi đã đăng nhập
    enabled: Boolean(_hasHydrated && isAuthenticated && user?.id),
    // Refetch mỗi 60 giây — đủ nhanh để thấy thông báo mới
    // NHANH hơn setInterval 5s → giảm 92% requests
    refetchInterval: 60 * 1000,
    // KHÔNG refetch khi tab ở background (tiết kiệm server)
    refetchOnWindowFocus: false,
    // Retry 1 lần nếu fail
    retry: 1,
  });

  // ──────────────────────────────────────────────────────────────
  // REACT QUERY: Lấy 5 thông báo chưa đọc gần nhất
  // ──────────────────────────────────────────────────────────────
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: queryKeys.notifications.unread(user?.id ?? 0),
    queryFn: () => notificationApi.getUnreadNotifications(user!.id),
    enabled: Boolean(_hasHydrated && isAuthenticated && user?.id),
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ──────────────────────────────────────────────────────────────
  // REACT QUERY: Lấy số lượng saved items
  // ──────────────────────────────────────────────────────────────
  // Cache trong 5 phút — không cần refetch thường xuyên
  const { data: savedItemsTotal = 0 } = useQuery({
    queryKey: ['saved', 'total', user?.id ?? 0],
    queryFn: async () => {
      if (!user?.id) return 0;
      // Dùng API có interceptor → tự động refresh token khi hết hạn
      const [companiesRes, jobsRes] = await Promise.all([
        savedCompanyApi.getUserSavedCompanies(user.id).catch(() => []),
        savedJobApi.getUserSavedJobs(user.id).catch(() => []),
      ]);
      return (Array.isArray(companiesRes) ? companiesRes.length : 0)
           + (Array.isArray(jobsRes) ? jobsRes.length : 0);
    },
    enabled: Boolean(_hasHydrated && isAuthenticated && user?.id),
    // Lưu cache 5 phút — user quay lại sau 5 phút mới refetch
    staleTime: 5 * 60 * 1000,
    // Giữ cache 10 phút — không xóa quá sớm
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ──────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────
  const handleNotificationClick = async (notification: Notification) => {
    try {
      await notificationApi.markAsRead(notification.id);
      // Invalidate cache → tự động refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.navbar(user!.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread(user!.id) });
    } catch {
      // silent fail
    }

    if (notification.relatedEntityType === 'job_application') {
      router.push('/applications/my-applications');
    } else if (notification.type === 'new_message' && notification.relatedEntityType === 'chat_conversation') {
      router.push('/chat');
    }
    setNotificationOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationApi.markAllAsRead(user.id);
      // Invalidate cache → tự động refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.navbar(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread(user.id) });
    } catch {
      // silent fail
    }
  };

  // ──────────────────────────────────────────────────────────────
  // NOTIFICATION DROPDOWN CONTENT
  // ──────────────────────────────────────────────────────────────
  const notificationContent = (
    <div style={{
      width: 350, maxHeight: 400, overflow: 'auto',
      background: '#fff', borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontWeight: 700, color: '#0b1220', fontSize: 15 }}>Thông báo</span>
        {navbarCount.notificationCount > 0 && (
          <Button
            type="link" size="small" onClick={handleMarkAllAsRead}
            style={{ color: '#16a34a', fontSize: 12 }}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        )}
      </div>

      {unreadNotifications.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Không có thông báo mới
        </div>
      ) : (
        <List
          dataSource={unreadNotifications.slice(0, 5)}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{ cursor: 'pointer', padding: '12px 16px' }}
              onClick={() => handleNotificationClick(item)}
            >
              <List.Item.Meta
                avatar={<NotificationIcon type={item.type} />}
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

      {unreadNotifications.length > 0 && (
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

  // ──────────────────────────────────────────────────────────────
  // USER MENU ITEMS
  // ──────────────────────────────────────────────────────────────
  const userMenuItems: MenuProps['items'] = [
    { key: '1', label: 'Hồ sơ của tôi', onClick: () => router.push('/profile') },
    { key: 'settings', label: 'Cài đặt tài khoản', onClick: () => router.push('/settings/profile') },
    { key: '2', label: 'Tạo CV Online', icon: <FileTextOutlined />, onClick: () => router.push('/cv-builder') },
    { type: 'divider' },
    { key: '4', label: 'Đăng xuất', danger: true, onClick: logout },
  ];

  // ──────────────────────────────────────────────────────────────
  // MOBILE MENU ITEMS
  // ──────────────────────────────────────────────────────────────
  const mobileMenuItems: MenuProps['items'] = [
    { key: '/', icon: <HomeOutlined />, label: 'Trang chủ', onClick: () => router.push('/') },
    { key: '/jobs', icon: <SearchOutlined />, label: 'Tìm việc làm', onClick: () => router.push('/jobs') },
    { key: '/saved-items', icon: <HeartOutlined />, label: 'Thư mục đã lưu', onClick: () => router.push('/saved-items') },
    { key: '/blog', icon: <FileTextOutlined />, label: 'Blog', onClick: () => router.push('/blog') },
  ];

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <Header
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
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
      <div style={{ maxWidth: 1200, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>V</span>
          </div>
          <span style={{
            fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'none',
            letterSpacing: '-0.02em'
          }} className="logo-text">
            ViệcLàm<span style={{ color: '#16a34a' }}>24h</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {[
            { href: '/', label: 'Trang chủ' },
            { href: '/jobs', label: 'Tìm việc làm' },
            { href: '/companies', label: 'Công ty' },
            { href: '/blog', label: 'Blog' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: router.pathname === item.href ? '#16a34a' : '#475569',
                fontWeight: router.pathname === item.href ? 700 : 500,
                fontSize: 14, textDecoration: 'none', transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              href="/saved-items"
              style={{
                color: router.pathname === '/saved-items' ? '#16a34a' : '#475569',
                fontWeight: router.pathname === '/saved-items' ? 700 : 500,
                fontSize: 14, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
            >
              Thư mục đã lưu
              {savedItemsTotal > 0 && (
                <span style={{
                  minWidth: 20, height: 20, borderRadius: 10,
                  background: '#16a34a', color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {savedItemsTotal}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && (
            <Link
              href="/chat"
              style={{
                color: router.pathname === '/chat' ? '#16a34a' : '#475569',
                fontWeight: router.pathname === '/chat' ? 700 : 500,
                fontSize: 14, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
            >
              <MessageOutlined style={{ fontSize: 14 }} />
              Tin nhắn
              {navbarCount.chatCount > 0 && (
                <span style={{
                  minWidth: 20, height: 20, borderRadius: 10,
                  background: '#ef4444', color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {navbarCount.chatCount > 99 ? '99+' : navbarCount.chatCount}
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
                icon={<MenuOutlined style={{ fontSize: 18, color: '#1e293b' }} />}
                style={{ width: 40, height: 40 }}
              />
            </Dropdown>
          </div>

          {!isAuthenticated ? (
            <Button
              type="primary" size="large"
              onClick={() => router.push('/login')}
              style={{
                height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                border: 'none', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
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
                <Badge count={navbarCount.notificationCount} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 18, color: '#475569' }} />}
                    style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  />
                </Badge>
              </Dropdown>

              {/* User Avatar & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="user-info-desktop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 13, color: '#0f172a', maxWidth: 120 }} ellipsis>
                    {user?.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>
                    ID: {user?.id}
                  </Text>
                </div>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Avatar
                    src={user?.avatarUrl}
                    icon={!user?.avatarUrl && <UserOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                      border: '2px solid #ffffff',
                    }}
                    size={40}
                  />
                </Dropdown>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .mobile-menu { display: none; }
        @media (min-width: 768px) {
          .logo-text { display: block !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu { display: flex !important; }
          .user-info-desktop { display: none !important; }
        }
        .desktop-nav a:hover { color: #16a34a !important; }
      `}</style>
    </Header>
  );
};
