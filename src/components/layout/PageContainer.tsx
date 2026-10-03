import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`min-h-screen pt-16 pb-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
};

