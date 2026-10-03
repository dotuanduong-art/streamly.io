import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(300);

    // Mock admin credentials for testing
    const isAdmin = credentials.email.includes('admin');

    const user: User = {
      id: isAdmin ? 'admin-1' : 'user-1',
      email: credentials.email,
      displayName: credentials.email.split('@')[0] || 'Movie Fan',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: isAdmin ? 'Admin' : 'User',
      createdAt: new Date().toISOString(),
    };

    return {
      accessToken: `mock-jwt-token-${Date.now()}`,
      user,
    };
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await delay(300);

    const user: User = {
      id: `user-${Date.now()}`,
      email: credentials.email,
      displayName: credentials.displayName,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'User',
      createdAt: new Date().toISOString(),
    };

    return {
      accessToken: `mock-jwt-token-${Date.now()}`,
      user,
    };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(150);
    return {
      id: 'user-1',
      email: 'user@streamly.app',
      displayName: 'Streamly User',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'User',
    };
  },
};


