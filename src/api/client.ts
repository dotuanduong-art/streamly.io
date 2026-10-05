import { TOKEN_STORAGE_KEY } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { normalizeApiError } from '@/lib/error';
import { navigateFromApi } from '@/lib/navigation';
import toast from 'react-hot-toast';

const API_URL = (
  import.meta.env.PROD
    ? 'https://streamly-api-long-2026-e4fsgkcbctfme3fx.japaneast-01.azurewebsites.net'
    : (import.meta.env.VITE_API_URL ?? 'https://localhost:7160')
).replace(/\/+$/, '');
export { TOKEN_STORAGE_KEY } from '@/lib/constants';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

let redirectingToLogin = false;

// Clear both persisted and in-memory auth; only redirect once per page.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    const requestPath = error.config?.url ?? '';
    const isAuthRequest = /(^|\/)auth\/(login|register)\/?$/i.test(requestPath);
    if (error.response?.status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
      if (!/^\/login\/?$/.test(window.location.pathname) && !redirectingToLogin) {
        redirectingToLogin = true;
        toast.error('Phiên đăng nhập đã hết hạn');
        const from = { pathname: window.location.pathname, search: window.location.search, hash: window.location.hash };
        navigateFromApi('/login', { replace: true, state: { from } });
        window.setTimeout(() => { redirectingToLogin = false; }, 0);
      }
    } else if (error.response?.status === 403) {
      toast.error('Bạn không có quyền truy cập');
    }
    return Promise.reject(normalizeApiError(error));
  }
);





