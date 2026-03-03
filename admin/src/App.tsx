import { useState } from 'react';
import { AdminLayout } from './shared/layout/AdminLayout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { UserManagementPage } from './features/users/pages/UserManagementPage';
import { LoginPage } from './features/auth/LoginPage';

type AdminView = 'dashboard' | 'users' | 'analytics' | 'settings';

const App = () => {
  const [view, setView] = useState<AdminView>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AdminLayout currentView={view} onChangeView={(nextView) => setView(nextView as AdminView)}>
      {(view === 'dashboard' || view === 'analytics') && <DashboardPage />}
      {(view === 'users' || view === 'settings') && <UserManagementPage />}
    </AdminLayout>
  );
};

export default App;
