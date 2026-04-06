import { useEffect, useRef, useState } from 'react';
import { App as AntdApp } from 'antd';
import { AdminLayout } from './shared/layout/AdminLayout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { UserManagementPage } from './features/users/pages/UserManagementPage';
import { DomainManagementPage } from './features/domains/pages/DomainManagementPage';
import { BlogManagementPage } from './features/blog/pages/BlogManagementPage';
import { BlogCreatePage } from './features/blog/pages/BlogCreatePage';
import { CategoryManagementPage } from './features/blog/pages/CategoryManagementPage';
import { ChatMonitorPage } from './features/chat/pages/ChatMonitorPage';
import { LoginPage } from './features/auth/LoginPage';
import { useAuthStore } from './features/auth/store/useAuthStore';
import {
  getAdminAntiDebugFingerprint,
  getAdminAntiDebugStatus,
  reportAdminAntiDebugEvent,
} from './shared/security/antiDebug';

type AdminView = 'dashboard' | 'users' | 'domains' | 'blog' | 'blogCreate' | 'blogCategory' | 'chat' | 'analytics' | 'settings';

const AppContent = () => {
  const [view, setView] = useState<AdminView>('dashboard');
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const devtoolsLockedRef = useRef(false);

  const clearSensitiveClientData = () => {
    localStorage.removeItem('auth-store');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
  };

  const isSensitiveView = (currentView: AdminView) => {
    const sensitiveViews: AdminView[] = [
      'dashboard',
      'users',
      'domains',
      'blog',
      'blogCreate',
      'blogCategory',
      'chat',
      'analytics',
      'settings',
    ];

    return sensitiveViews.includes(currentView);
  };

  useEffect(() => {
    const antiDebugEnabled =
      import.meta.env.VITE_ENABLE_ANTI_DEBUG === 'true' ||
      import.meta.env.PROD;

    if (!antiDebugEnabled) {
      return;
    }

    if (!isLoggedIn || !isSensitiveView(view)) {
      return;
    }

    const fingerprint = getAdminAntiDebugFingerprint();

    const forceLogoutForDevtools = async (eventName: string, lockSeconds: number = 0) => {
      if (devtoolsLockedRef.current) {
        return;
      }
      devtoolsLockedRef.current = true;

      try {
        await reportAdminAntiDebugEvent(view, eventName, fingerprint);
      } catch {
        // Ignore logging failures and proceed with logout.
      }

      clearSensitiveClientData();
      logout();
      const minuteText = lockSeconds > 0 ? ` He thong khoa tam thoi ${Math.ceil(lockSeconds / 60)} phut.` : '';
      window.alert(`Phat hien cong cu devtools. He thong da dang xuat de bao ve du lieu.${minuteText}`);
    };

    void (async () => {
      try {
        const status = await getAdminAntiDebugStatus(fingerprint);
        if (status.locked) {
          await forceLogoutForDevtools('locked_status', status.lockRemainingSeconds);
        }
      } catch {
        // Keep UX unchanged if status API is unavailable.
      }
    })();

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blockedShortcut =
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (event.ctrlKey && key === 'u');

      if (!blockedShortcut) {
        return;
      }

      event.preventDefault();
      void forceLogoutForDevtools('blocked_shortcut');
    };

    const detectDevtoolsOpen = () => {
      const threshold = 160;
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      const isDevtoolsOpen = widthGap > threshold || heightGap > threshold;

      if (isDevtoolsOpen) {
        void forceLogoutForDevtools('devtools_open');
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      void forceLogoutForDevtools('context_menu');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('contextmenu', onContextMenu);
    const intervalId = window.setInterval(detectDevtoolsOpen, 1000);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('contextmenu', onContextMenu);
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, logout, view]);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <AdminLayout
      currentView={view}
      onChangeView={(nextView) => setView(nextView as AdminView)}
      onLogout={logout}
      onCreateClick={(target) => {
        if (target === 'blogCreate') {
          setView('blogCreate');
        }
      }}
    >
      {(view === 'dashboard' || view === 'analytics') && <DashboardPage />}
      {view === 'users' && <UserManagementPage />}
      {view === 'domains' && <DomainManagementPage />}
      {view === 'blog' && <BlogManagementPage onAdd={() => setView('blogCreate')} />}
      {view === 'blogCreate' && <BlogCreatePage onBackToList={() => setView('blog')} />}
      {view === 'blogCategory' && <CategoryManagementPage />}
      {view === 'chat' && <ChatMonitorPage />}
      {view === 'settings' && <UserManagementPage />}
    </AdminLayout>
  );
};

const App = () => {
  return (
    <AntdApp>
      <AppContent />
    </AntdApp>
  );
};

export default App;
