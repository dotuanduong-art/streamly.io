import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Watch Trailer #{id}</h1>
      <p className="text-text-secondary mt-2">Watch page placeholder.</p>
    </PageContainer>
  );
};

export default WatchPage;
