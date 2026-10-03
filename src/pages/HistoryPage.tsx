import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export const HistoryPage: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Watch History</h1>
      <p className="text-text-secondary mt-2">History page placeholder (Protected User Route).</p>
    </PageContainer>
  );
};

export default HistoryPage;
