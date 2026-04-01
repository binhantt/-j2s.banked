import { getAccessToken } from './tokenStorage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://hovan.online/api';

export class BannedException extends Error {
  readonly banned = true;
  constructor(message: string) {
    super(message);
    this.name = 'BannedException';
  }
}

export async function httpRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Có lỗi xảy ra từ server';
    let banned = false;
    try {
      const data = (await response.json()) as { message?: string; banned?: boolean };
      if (data?.banned) {
        banned = true;
        message = data.message || 'Tài khoản của bạn đã bị khóa.';
      } else if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore json parsing error
    }
    if (banned) {
      throw new BannedException(message);
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
