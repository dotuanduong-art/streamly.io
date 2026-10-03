import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

export const RegisterPage: React.FC = () => {
  return (
    <PageContainer className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-surface border border-white/10 rounded-xl space-y-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
        <p className="text-sm text-text-secondary">Register page placeholder.</p>
      </div>
    </PageContainer>
  );
};

export default RegisterPage;
