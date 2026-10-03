import type { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { mockLogin, mockRegister } from '@/features/auth/mockAuth';

function unavailable(): never {
  throw { status: 503, message: 'Authentication is not available from the backend yet.' };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (!USE_MOCK_AUTH) return unavailable();
    return mockLogin(credentials);
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    if (!USE_MOCK_AUTH) return unavailable();
    return mockRegister(credentials);
  },
};


