import { httpRequest } from '../../../shared/api/httpClient';
import type { AccountGroup, AccountRole, UserAdminRow } from '../types/userTypes';

interface UserAdminResponse {
  id: number;
  fullName: string;
  email: string;
  group: string;
  role: string | null;
  active: boolean;
  createdAt: string | null;
  lastLogin: string | null;
}

export const usersApi = {
  async getAdminUsers(): Promise<UserAdminRow[]> {
    const data = await httpRequest<UserAdminResponse[]>('/users');

    return data.map((item) => {
      const group: AccountGroup = item.group === 'backend' ? 'backend' : 'user';

      // Map role từ backend (userType) sang AccountRole, default là 'job_seeker'
      const roleFromBackend = (item.role || 'job_seeker') as AccountRole;

      return {
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        group,
        role: roleFromBackend,
        isActive: item.active ?? true,
        createdAt: item.createdAt ?? '',
        lastLogin: item.lastLogin ?? '',
      };
    });
  },
};

