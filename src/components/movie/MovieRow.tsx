import { useId } from 'react';
import type { Movie } from '@/types';
import { Carousel } from '@/components/carousel/Carousel';
import { MovieCard } from './MovieCard';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';

export interface MovieRowProps { title: string; movies?: Movie[]; isLoading?: boolean; isError?: boolean; onRetry?: () => void }
export function MovieRow({ title, movies = [], isLoading, isError, onRetry }: MovieRowProps) {
  const id = useId();
  if (!isLoading && !isError && !movies.length) return null;
  return <section aria-labelledby={id} className="movie-row relative mb-10 md:mb-12">
    <h2 id={id} className="mb-5 text-section font-semibold tracking-tight">{title}</h2>
    {isError ? <ErrorState title={`Unable to load ${title}`} onRetry={onRetry} /> : <Carousel label={title}>
      {isLoading ? Array.from({ length: 6 }, (_, index) => <div key={index} role="status" aria-label="Loading movies"><Skeleton className="aspect-video w-full" /><Skeleton className="mt-3 h-5 w-2/3" /></div>) : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </Carousel>}
  </section>;
}
