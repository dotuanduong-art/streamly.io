import { create } from 'zustand';
import { User, AuthResponse } from '@/types';
import { TOKEN_STORAGE_KEY } from '@/lib/constants';

const USER_STORAGE_KEY = 'streamly_user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  setAuth: (user: User | null, accessToken: string | null) => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

// Initial state loaded from localStorage if existing
const getInitialToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

const getInitialUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  isLoading: false,

  login: (authData: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, authData.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
    set({
      user: authData.user,
      accessToken: authData.accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setAuth: (user: User | null, accessToken: string | null) => {
    if (accessToken && user) {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      set({ user, accessToken, isAuthenticated: true });
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  updateUser: (updatedFields: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      return { user: newUser };
    });
  },
}));

