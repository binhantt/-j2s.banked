export interface LoginPayload {
  email: string;
  password: string;
}

export interface BannedError {
  banned: true;
  message: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  userType: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  userType: string;
}

