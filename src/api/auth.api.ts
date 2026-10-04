import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { mockAuthDemoCredentials, mockGetCurrentUser, mockLogin, mockRegister } from '@/mocks/auth/api';
import { apiClient } from './client';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK_AUTH) return mockLogin(credentials);
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    if (USE_MOCK_AUTH) return mockRegister(credentials);
    const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK_AUTH) {
      return mockGetCurrentUser();
    }
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};

export { mockAuthDemoCredentials };


