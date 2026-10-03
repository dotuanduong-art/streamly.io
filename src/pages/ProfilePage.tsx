import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <PageContainer>
      <div className="max-w-xl p-8 bg-surface border border-white/10 rounded-xl space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">User Profile</h1>
        <p className="text-text-secondary">Email: {user?.email}</p>
        <p className="text-text-secondary">Display Name: {user?.displayName}</p>
        <p className="text-text-secondary">Role: {user?.role}</p>
        <div className="pt-4">
          <Button variant="danger" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
