export type AccountGroup = 'user' | 'backend';

export type AccountRole = 'job_seeker' | 'freelancer' | 'hr' | 'admin' | 'super_admin' | 'moderator' | 'support';

export interface UserAdminRow {
  id: number;
  fullName: string;
  email: string;
  group: AccountGroup;
  role: AccountRole;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}
