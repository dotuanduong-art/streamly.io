import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TrailerPlayer } from '@/components/movie/TrailerPlayer';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { useMovie } from '@/features/movies/hooks';
import { isValidMovieId } from '@/lib/movie';
import { normalizeApiError } from '@/lib/error';

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const validId = isValidMovieId(movieId);
  const movie = useMovie(movieId);
  const notFound = !validId || (movie.isError && normalizeApiError(movie.error).status === 404);

  useEffect(() => { document.title = movie.data ? `${movie.data.title} Trailer | Streamly` : 'Watch Trailer | Streamly'; }, [movie.data]);

  return <div className="min-h-screen bg-background px-4 py-6 sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <Link to={validId ? `/movie/${movieId}` : '/'} className="inline-flex items-center gap-2 rounded-button px-2 py-2 text-text-secondary hover:text-text-primary"><ArrowLeft size={20} />Back</Link>
      {notFound ? <div className="py-24 text-center"><h1 className="text-4xl font-bold">Movie not found</h1><p className="mt-4 text-text-secondary">{movie.error ? normalizeApiError(movie.error).message : 'Movie not found.'}</p><Link to="/" className="mt-7 inline-block text-brand hover:underline">Go home</Link></div>
        : movie.isLoading ? <div className="mt-6"><Skeleton className="aspect-video w-full rounded-card" /><Skeleton className="mt-5 h-9 w-1/2" /></div>
        : movie.isError ? <ErrorState title="Unable to load trailer" error={movie.error} onRetry={() => void movie.refetch()} />
        : movie.data ? <main className="mt-5"><TrailerPlayer trailerKey={movie.data.trailerKey} title={movie.data.title} autoPlay /><div className="mt-6 flex flex-wrap items-baseline justify-between gap-3"><h1 className="text-2xl font-bold sm:text-3xl">{movie.data.title}</h1><span className="text-sm text-text-secondary">Official trailer</span></div>{!movie.data.trailerKey?.trim() && <p className="mt-5 text-text-secondary">This movie does not have a trailer yet. <Link className="text-brand hover:underline" to={`/movie/${movie.data.id}`}>Return to movie details</Link>.</p>}</main>
        : null}
    </div>
  </div>;
}
