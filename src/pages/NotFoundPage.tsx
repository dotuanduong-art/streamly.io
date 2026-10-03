import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-6xl font-extrabold text-brand mb-4">404</h1>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Lost your way?</h2>
      <p className="text-text-secondary max-w-md mb-6">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </PageContainer>
  );
};

export default NotFoundPage;
