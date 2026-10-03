import { HeroBanner } from '@/components/hero/HeroBanner';
import { MovieRow } from '@/components/movie/MovieRow';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useFeaturedMovies, useTrendingMovies, useNewMovies, useMoviesByGenre, useGenres } from '@/features/movies/hooks';
import type { Genre } from '@/types';

function GenreRow({ genre }: { genre: Genre }) {
  const query = useMoviesByGenre(genre.id);
  return <MovieRow title={genre.name} movies={query.data?.items} isLoading={query.isPending} isError={query.isError} onRetry={() => void query.refetch()} />;
}
export default function HomePage() {
  const featured = useFeaturedMovies();
  const trending = useTrendingMovies();
  const newlyAdded = useNewMovies();
  const genres = useGenres();
  return <>
    <HeroBanner movie={featured.data?.[0]} isLoading={featured.isPending} isError={featured.isError} onRetry={() => void featured.refetch()} />
    <div className="page-gutter relative pb-6">
      <MovieRow title="Trending Now" movies={trending.data} isLoading={trending.isPending} isError={trending.isError} onRetry={() => void trending.refetch()} />
      <MovieRow title="Newly Added" movies={newlyAdded.data} isLoading={newlyAdded.isPending} isError={newlyAdded.isError} onRetry={() => void newlyAdded.refetch()} />
      {genres.isPending && <MovieRow title="Explore by genre" isLoading />}
      {genres.isError && <ErrorState title="Unable to load genres" onRetry={() => void genres.refetch()} />}
      {genres.data?.map((genre) => <GenreRow key={genre.id} genre={genre} />)}
    </div>
  </>;
}
