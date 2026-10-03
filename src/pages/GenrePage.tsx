import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

export const GenrePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Genre #{id} Movies</h1>
      <p className="text-text-secondary mt-2">Genre page placeholder.</p>
    </PageContainer>
  );
};

export default GenrePage;
