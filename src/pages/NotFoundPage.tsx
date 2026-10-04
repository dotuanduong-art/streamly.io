import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Không tìm thấy trang | Streamly');
  return (
    <main id="main-content"><PageContainer className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-6xl font-extrabold text-brand mb-4">404</h1>
      <h2 className="text-2xl font-bold leading-snug text-text-primary mb-2">Không tìm thấy trang</h2>
      <p className="text-text-secondary max-w-md mb-6">
        Trang đang tìm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link to="/">
        <Button variant="primary">Về trang chủ</Button>
      </Link>
    </PageContainer></main>
  );
};

export default NotFoundPage;
