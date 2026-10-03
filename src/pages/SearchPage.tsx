import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-text-primary">
        Search Results {query ? `for "${query}"` : ''}
      </h1>
      <p className="text-text-secondary mt-2">Search page placeholder.</p>
    </PageContainer>
  );
};

export default SearchPage;
