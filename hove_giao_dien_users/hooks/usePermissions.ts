import { useAuthStore } from '@/store/useAuthStore';
import { getUserPermissions, Permission } from '@/lib/permissions';

export const usePermissions = (): Permission & { userType: string | null } => {
  const { user } = useAuthStore();

  if (!user) {
    return {
      userType: null,
      canPostJob: false,
      canApplyJob: false,
      canCreateCV: false,
      canPostFreelanceProject: false,
      canApplyFreelance: false,
    };
  }

  return {
    userType: user.userType,
    ...getUserPermissions(user.userType),
  };
};
