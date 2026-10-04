import React from 'react';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có nội dung',
  description = 'Hiện chưa có nội dung để hiển thị.',
  icon = <Film className="w-12 h-12 text-text-muted" />,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-surface/50 border border-white/5 rounded-xl my-6">
      <div className="p-4 rounded-full bg-white/5 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
