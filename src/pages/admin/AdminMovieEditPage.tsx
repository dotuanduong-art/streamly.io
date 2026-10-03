import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

export const AdminMovieEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {isNew ? 'Admin - Add New Movie' : `Admin - Edit Movie #${id}`}
      </h1>
      <p className="text-text-secondary">Admin movie form placeholder.</p>
    </PageContainer>
  );
};

export default AdminMovieEditPage;
