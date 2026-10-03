import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminRouteProps {
  children: React.ReactElement;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'Admin') {
    // Non-admin attempting to access admin page: redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};
