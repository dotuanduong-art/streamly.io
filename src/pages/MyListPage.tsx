import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export const MyListPage: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">My List</h1>
      <p className="text-text-secondary mt-2">My List page placeholder (Protected User Route).</p>
    </PageContainer>
  );
};

export default MyListPage;
