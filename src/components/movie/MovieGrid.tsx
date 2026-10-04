import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { MovieDetail } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { getReleaseYear } from '@/lib/movie';

export interface MovieGridProps {
  movies?: MovieDetail[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: string;
  renderAction?: (movie: MovieDetail) => ReactNode;
  renderMeta?: (movie: MovieDetail) => ReactNode;
  itemTestId?: (movie: MovieDetail) => string;
}

export function MovieGrid({ movies = [], isLoading = false, error, onRetry, emptyMessage = 'No movies found.', renderAction, renderMeta, itemTestId }: MovieGridProps) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isLoading) return <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
    {Array.from({ length: 12 }, (_, index) => <div key={index} role="status" aria-label="Loading movie"><Skeleton className="aspect-[2/3] w-full rounded-card" /><Skeleton className="mt-3 h-5 w-3/4" /></div>)}
  </div>;
  if (!movies.length) return <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center text-text-secondary">{emptyMessage}</div>;
  return <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
    {movies.map((movie) => {
      const year = getReleaseYear(movie.releaseDate);
      return <article key={movie.id} data-testid={itemTestId?.(movie)} className="group relative min-w-0">
        <Link data-testid={`movie-card-${movie.id}`} to={`/movie/${movie.id}`} className="block rounded-card transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1">
          <SmartImage path={movie.posterUrl} alt={movie.title} className="aspect-[2/3] rounded-card shadow-card" />
          <h2 className="mt-3 truncate font-semibold group-hover:text-brand">{movie.title}</h2>
          {year && <p className="mt-1 text-caption text-text-secondary">{year}</p>}
        </Link>
        {renderMeta?.(movie)}
        {renderAction && <div className="absolute right-2 top-2 z-10">{renderAction(movie)}</div>}
      </article>;
    })}
  </div>;
}
