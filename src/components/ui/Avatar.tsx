import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export function Avatar({ name, avatarUrl, className = '' }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [avatarUrl]);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || '?';
  return <span role="img" aria-label={`${name} avatar`} className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-sm font-bold text-text-primary', className)}>
    {avatarUrl && !failed ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} /> : initials}
  </span>;
}
