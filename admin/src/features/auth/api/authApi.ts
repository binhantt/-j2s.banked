import { httpRequest } from '../../../shared/api/httpClient';
import type { AuthResponse, LoginPayload } from '../types/authTypes';

export const authApi = {
  login(payload: LoginPayload) {
    return httpRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

