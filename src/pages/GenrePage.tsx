import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useGenres, useMoviesByGenre } from '@/features/movies/hooks';
import { isValidMovieId } from '@/lib/movie';

const PAGE_SIZE = 12;

export default function GenrePage() {
  const { id } = useParams<{ id: string }>();
  const genreId = Number(id);
  const [page, setPage] = useState(1);
  const genres = useGenres();
  const movies = useMoviesByGenre(genreId, 1, page * PAGE_SIZE);
  const genre = genres.data?.find((item) => item.id === genreId);

  useEffect(() => setPage(1), [genreId]);
  useEffect(() => { document.title = genre ? `${genre.name} Movies | Streamly` : 'Genres | Streamly'; }, [genre]);

  if (!isValidMovieId(genreId)) return <PageContainer><div className="py-24 text-center"><h1 className="text-4xl font-bold">Genre not found</h1><Link className="mt-6 inline-block text-brand hover:underline" to="/">Back to home</Link></div></PageContainer>;
  if (genres.isLoading) return <PageContainer><MovieGrid isLoading /></PageContainer>;
  if (genres.isError) return <PageContainer><ErrorState title="Unable to load genres" error={genres.error} onRetry={() => void genres.refetch()} /></PageContainer>;
  if (!genre) return <PageContainer><div className="py-24 text-center"><h1 className="text-4xl font-bold">Genre not found</h1><Link className="mt-6 inline-block text-brand hover:underline" to="/">Back to home</Link></div></PageContainer>;

  return <PageContainer>
    <header className="py-10 sm:py-14"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Browse by genre</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">{genre.name}</h1>
      <nav aria-label="Genres" className="mt-7 flex flex-wrap gap-2">{genres.data?.map((item) => <Link key={item.id} to={`/genre/${item.id}`} aria-current={item.id === genreId ? 'page' : undefined} className={`rounded-full border px-4 py-2 text-sm ${item.id === genreId ? 'border-brand bg-brand text-white' : 'border-text-primary/15 hover:bg-surface-elevated'}`}>{item.name}</Link>)}</nav>
    </header>
    <MovieGrid movies={movies.data?.items} isLoading={movies.isLoading} error={movies.error} onRetry={() => void movies.refetch()} emptyMessage={`No ${genre.name} movies are available yet.`} />
    {movies.data && page < movies.data.totalPages && <div className="mt-10 flex justify-center"><Button onClick={() => setPage((current) => current + 1)}>Load more</Button></div>}
  </PageContainer>;
}
