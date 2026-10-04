import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/feedback/Skeleton';

export interface TrailerPlayerProps {
  trailerKey?: string | null;
  title: string;
  autoPlay?: boolean;
}

export function TrailerPlayer({ trailerKey, title, autoPlay = false }: TrailerPlayerProps) {
  const key = trailerKey?.trim();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [key]);

  if (!key) {
    return <div className="flex aspect-video items-center justify-center rounded-card bg-surface-elevated p-8 text-center text-text-secondary">Trailer chưa có</div>;
  }
  const src = `https://www.youtube.com/embed/${key}${autoPlay ? '?autoplay=1' : ''}`;
  return <div className="relative aspect-video overflow-hidden rounded-card bg-background">
    {!loaded && <Skeleton className="absolute inset-0 h-full w-full" aria-label="Đang tải trailer" />}
    <iframe
      className={`h-full w-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      src={src}
      title={`Trailer của ${title}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      onLoad={() => setLoaded(true)}
    />
  </div>;
}
