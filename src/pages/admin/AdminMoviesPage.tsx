import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export const AdminMoviesPage: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Admin - Movies Management</h1>
      <p className="text-text-secondary">Admin movies list placeholder.</p>
    </PageContainer>
  );
};

export default AdminMoviesPage;
