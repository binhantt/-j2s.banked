export type AccountGroup = 'user' | 'backend';

export type UserRole = 'job_seeker' | 'freelancer' | 'hr' | 'admin';

export type BackendRole = 'super_admin' | 'moderator' | 'support';

export type AccountRole = UserRole | BackendRole;

// Dòng dữ liệu hiển thị trên bảng quản lý User & Backend
export interface UserAdminRow {
  id: number;
  fullName: string;
  email: string;
  group: AccountGroup;
  role: AccountRole;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

