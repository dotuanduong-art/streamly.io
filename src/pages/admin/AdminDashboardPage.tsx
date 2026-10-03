import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export const AdminDashboardPage: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
      <p className="text-text-secondary">Admin management dashboard placeholder.</p>
    </PageContainer>
  );
};

export default AdminDashboardPage;
