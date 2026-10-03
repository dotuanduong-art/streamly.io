import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { Skeleton } from '@/components/feedback/Skeleton';

interface SmartImageProps {
  path?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}
export function SmartImage({ path, alt, className = '', priority = false }: SmartImageProps) {
  const src = getImageUrl(path);
  return <ImageContent key={src} src={src} alt={alt} className={className} priority={priority} />;
}
function ImageContent({ src, alt, className, priority }: { src: string | null; alt: string; className: string; priority: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-surface-elevated', className)}>
      {src && !failed ? <>
        {!loaded && <Skeleton className="absolute inset-0 h-full w-full" aria-label="Loading image" />}
        <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async"
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      </> : <div role="img" aria-label={`${alt}: image unavailable`} className="flex h-full min-h-24 items-center justify-center text-text-secondary"><ImageOff aria-hidden="true" size={28} /></div>}
    </div>
  );
}
