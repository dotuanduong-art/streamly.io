import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full border border-text-primary/15 bg-surface/75 px-3 py-1 text-caption font-semibold text-text-primary backdrop-blur-sm', className)} {...props} />;
}
