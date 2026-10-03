import { useId } from 'react';
import type { MovieDetail } from '@/types';
import { getErrorMessage } from '@/lib/error';
import { Carousel } from '@/components/carousel/Carousel';
import { MovieCard } from './MovieCard';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';

export interface MovieRowProps { title: string; movies?: MovieDetail[]; isLoading?: boolean; error?: unknown; onRetry?: () => void }
export function MovieRow({ title, movies = [], isLoading, error, onRetry }: MovieRowProps) {
  const id = useId();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!isLoading && !error && !movies.length) return null;
  return <section data-testid={`movie-row-${slug}`} aria-labelledby={id} className="movie-row relative mb-10 md:mb-12">
    <h2 id={id} className="mb-5 text-section font-semibold tracking-tight">{title}</h2>
    {error ? <ErrorState title={`Unable to load ${title}`} message={getErrorMessage(error)} onRetry={onRetry} /> : <Carousel label={title}>
      {isLoading ? Array.from({ length: 6 }, (_, index) => <div key={index} role="status" aria-label="Loading movies"><Skeleton className="aspect-video w-full" /><Skeleton className="mt-3 h-5 w-2/3" /></div>) : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </Carousel>}
  </section>;
}
