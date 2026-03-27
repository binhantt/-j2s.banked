import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { message } from 'antd';
import { UserType } from '@/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserTypes?: UserType[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedUserTypes,
  redirectTo = '/login',
}) => {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setHydrated(true);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (!hydrated) return; // Chưa rehydrate xong → đừng làm gì

    if (requireAuth && !isAuthenticated) {
      message.warning('Vui lòng đăng nhập để tiếp tục');
      router.push(redirectTo);
      return;
    }

    if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
      message.error('Bạn không có quyền truy cập trang này');
      router.push('/');
    }
  }, [hydrated, isAuthenticated, user, requireAuth, allowedUserTypes, redirectTo, router]);

  // Loading state — đợi rehydrate thay vì redirect nhầm sang /login
  if (!hydrated) {
    return null;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
    return null;
  }

  return <>{children}</>;
};
