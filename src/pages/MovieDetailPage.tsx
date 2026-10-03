import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ErrorState } from '@/components/feedback/ErrorState';
import { MovieDetail } from '@/features/movies/components/MovieDetail';
import { MovieDetailSkeleton } from '@/features/movies/components/MovieDetailSkeleton';
import { useMovie } from '@/features/movies/hooks';
import { isValidMovieId } from '@/lib/movie';
import { normalizeApiError } from '@/lib/error';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const validId = isValidMovieId(movieId);
  const movie = useMovie(movieId);
  const notFound = !validId || (movie.isError && normalizeApiError(movie.error).status === 404);

  useEffect(() => {
    document.title = movie.data ? `${movie.data.title} | Streamly` : 'Movie | Streamly';
    return () => { document.title = 'Streamly'; };
  }, [movie.data]);

  if (notFound) {
    const message = movie.error ? normalizeApiError(movie.error).message : 'Movie not found.';
    return <PageContainer><div className="mx-auto max-w-xl py-24 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-brand">404</p><h1 className="mt-3 text-4xl font-bold">Movie not found</h1><p className="mt-4 text-text-secondary">{message}</p><Link className="mt-8 inline-flex rounded-button bg-text-primary px-5 py-3 font-semibold text-background" to="/">Back to home</Link></div></PageContainer>;
  }
  if (movie.isLoading) return <MovieDetailSkeleton />;
  if (movie.isError) return <PageContainer><ErrorState title="Unable to load movie" error={movie.error} onRetry={() => void movie.refetch()} /></PageContainer>;
  if (!movie.data) return null;
  return <MovieDetail movie={movie.data} />;
}
