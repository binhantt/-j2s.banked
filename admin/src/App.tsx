import { useState } from 'react';
import { App as AntdApp } from 'antd';
import { AdminLayout } from './shared/layout/AdminLayout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { UserManagementPage } from './features/users/pages/UserManagementPage';
import { DomainManagementPage } from './features/domains/pages/DomainManagementPage';
import { BlogManagementPage } from './features/blog/pages/BlogManagementPage';
import { BlogCreatePage } from './features/blog/pages/BlogCreatePage';
import { ChatMonitorPage } from './features/chat/pages/ChatMonitorPage';
import { LoginPage } from './features/auth/LoginPage';
import { useAuthStore } from './features/auth/store/useAuthStore';

type AdminView = 'dashboard' | 'users' | 'domains' | 'blog' | 'blogCreate' | 'chat' | 'analytics' | 'settings';

const AppContent = () => {
  const [view, setView] = useState<AdminView>('dashboard');
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);

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
      {view === 'blog' && <BlogManagementPage />}
      {view === 'blogCreate' && <BlogCreatePage onBackToList={() => setView('blog')} />}
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
