import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-status-error/10 border border-status-error/20 rounded-xl my-6">
      <div className="p-4 rounded-full bg-status-error/20 mb-4 text-status-error">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
