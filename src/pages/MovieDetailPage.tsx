import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">Movie Detail #{id}</h1>
      <p className="text-text-secondary mt-2">Movie detail page placeholder.</p>
    </PageContainer>
  );
};

export default MovieDetailPage;
