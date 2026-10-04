import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { mockLogin, mockRegister } from '@/features/auth/mockAuth';
import { apiClient } from './client';
import { useAuthStore } from '@/store/useAuthStore';

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
      const user = useAuthStore.getState().user;
      if (!user) throw { status: 401, message: 'Session expired' };
      return user;
    }
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};


