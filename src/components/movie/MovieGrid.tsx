import type { ReactNode } from 'react';
import type { MovieDetail } from '@/types';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { MovieCard } from './MovieCard';
import { EmptyState } from '@/components/feedback/EmptyState';

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

export function MovieGrid({ movies = [], isLoading = false, error, onRetry, emptyMessage = 'Không tìm thấy phim.', renderAction, renderMeta, itemTestId }: MovieGridProps) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isLoading) return <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
    {Array.from({ length: 12 }, (_, index) => <div key={index} role="status" aria-label="Đang tải phim"><Skeleton className="aspect-[2/3] w-full rounded-card" /><Skeleton className="mt-3 h-5 w-3/4" /></div>)}
  </div>;
  if (!movies.length) return <EmptyState title="Không tìm thấy phim" description={emptyMessage} />;
  return <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
    {movies.map((movie) => {
      return <article key={movie.id} data-testid={itemTestId?.(movie)} className="group relative min-w-0 focus-within:z-20 hover:z-20">
        <MovieCard movie={movie} showListAction={!renderAction} />
        {renderMeta?.(movie)}
        {renderAction && <div className="absolute right-2 top-2 z-10">{renderAction(movie)}</div>}
      </article>;
    })}
  </div>;
}
