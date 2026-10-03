import { Link } from 'react-router-dom';
import { Info, Play, Star } from 'lucide-react';
import type { Movie } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';

export interface HeroBannerProps { movie?: Movie; isLoading?: boolean; isError?: boolean; onRetry?: () => void }
export function HeroBanner({ movie, isLoading, isError, onRetry }: HeroBannerProps) {
  if (isLoading) return <section className="hero-frame page-gutter flex items-center" aria-label="Loading featured movie" role="status"><div className="w-full max-w-xl space-y-6"><Skeleton className="h-4 w-32" /><Skeleton className="h-24 w-4/5" /><Skeleton className="h-16 w-full" /><Skeleton className="h-12 w-64" /></div></section>;
  if (isError || !movie) return <section className="hero-frame page-gutter flex items-center justify-center">{isError ? <ErrorState title="Unable to load featured movie" onRetry={onRetry} /> : <EmptyState title="More stories are on their way" description="Check back soon for our featured selection." />}</section>;
  return <section className="hero-frame relative isolate flex items-center">
    <SmartImage path={movie.backdropPath} size="original" alt="" priority className="absolute inset-0 -z-30 h-full w-full" />
    <div className="hero-gradient-left absolute inset-0 -z-20" /><div className="hero-gradient-bottom absolute inset-0 -z-10" />
    <div className="page-gutter w-full pb-12 pt-24 md:pb-16">
      <div className="max-w-xl">
        <p className="mb-4 text-caption font-semibold uppercase tracking-widest text-text-secondary">The featured selection</p>
        <h1 className="text-hero font-bold tracking-tight">{movie.title}</h1>
        <div className="mt-5 flex items-center gap-4 text-metadata text-text-secondary"><span className="flex items-center gap-1 text-status-success"><Star size={16} fill="currentColor" />{movie.rating.toFixed(1)}</span><span>{movie.year}</span><span>{movie.runtime} min</span></div>
        <p className="mt-5 max-w-lg line-clamp-3 text-body leading-relaxed text-text-primary/85">{movie.overview}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {movie.trailerKey && <Link className="hero-button bg-text-primary text-background hover:bg-text-secondary" to={`/watch/${movie.id}`}><Play size={20} fill="currentColor" />Play</Link>}
          <Link className="hero-button bg-surface-elevated/90 text-text-primary hover:bg-surface-hover" to={`/movie/${movie.id}`}><Info size={20} />More Info</Link>
        </div>
        {!movie.trailerKey && <p className="mt-3 text-caption text-text-secondary">Trailer unavailable for this title.</p>}
      </div>
    </div>
  </section>;
}
