import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface GuestRouteProps {
  children: ReactElement;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const returnTo = `${from?.pathname ?? '/'}${from?.search ?? ''}${from?.hash ?? ''}`;
  return isAuthenticated ? <Navigate to={returnTo} replace /> : children;
}
