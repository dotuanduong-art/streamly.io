import {
  useEffect,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

const API_URL = (
  import.meta.env.PROD
    ? 'https://streamly-api-long-2026-e4fsgkcbctfme3fx.japaneast-01.azurewebsites.net'
    : (import.meta.env.VITE_API_URL ?? 'https://localhost:7160')
).replace(/\/+$/, '');

function resolveAvatarUrl(
  avatarUrl?: string | null
): string | null {
  if (!avatarUrl) {
    return null;
  }

  if (
    avatarUrl.startsWith(
      'http://'
    ) ||
    avatarUrl.startsWith(
      'https://'
    ) ||
    avatarUrl.startsWith(
      'blob:'
    ) ||
    avatarUrl.startsWith(
      'data:'
    )
  ) {
    return avatarUrl;
  }

  if (
    avatarUrl.startsWith('/') &&
    API_URL
  ) {
    return `${API_URL}${avatarUrl}`;
  }

  return avatarUrl;
}

export function Avatar({
  name,
  avatarUrl,
  className = '',
}: AvatarProps) {
  const [
    failed,
    setFailed,
  ] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  const resolvedAvatarUrl =
    resolveAvatarUrl(avatarUrl);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0)
      )
      .join('')
      .toUpperCase() || '?';

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-sm font-bold text-text-primary',
        className
      )}
    >
      {resolvedAvatarUrl &&
      !failed ? (
        <img
          src={
            resolvedAvatarUrl
          }
          alt={`Ảnh đại diện của ${name}`}
          className="h-full w-full object-cover"
          onError={() =>
            setFailed(true)
          }
        />
      ) : (
        <span
          role="img"
          aria-label={`Ảnh đại diện của ${name}`}
        >
          {initials}
        </span>
      )}
    </span>
  );
}