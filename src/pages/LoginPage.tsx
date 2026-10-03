import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoUserLogin = () => {
    login({
      accessToken: 'demo-user-token',
      user: {
        id: 'u-1',
        email: 'user@streamly.app',
        displayName: 'Demo User',
        role: 'User',
      },
    });
    navigate('/my-list');
  };

  const handleDemoAdminLogin = () => {
    login({
      accessToken: 'demo-admin-token',
      user: {
        id: 'a-1',
        email: 'admin@streamly.app',
        displayName: 'Demo Admin',
        role: 'Admin',
      },
    });
    navigate('/admin');
  };

  return (
    <PageContainer className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-surface border border-white/10 rounded-xl space-y-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Sign In</h1>
        <p className="text-sm text-text-secondary">
          Login page placeholder for testing auth & route guards.
        </p>
        <div className="space-y-3 pt-4">
          <Button fullWidth variant="primary" onClick={handleDemoUserLogin}>
            Login as Demo User
          </Button>
          <Button fullWidth variant="secondary" onClick={handleDemoAdminLogin}>
            Login as Demo Admin
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
