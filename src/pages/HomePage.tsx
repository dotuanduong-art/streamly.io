import { HeroBanner } from '@/components/hero/HeroBanner';
import { MovieRow } from '@/components/movie/MovieRow';
import { useFeaturedMovies, useTrendingMovies, useRecentlyReleasedMovies, useNewMovies, useMoviesByGenre, useGenres } from '@/features/movies/hooks';
import type { Genre } from '@/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function GenreRow({ genre }: { genre: Genre }) {
  const query = useMoviesByGenre(genre.id);
  return <MovieRow title={genre.name} movies={query.data?.items} isLoading={query.isPending} error={query.error} onRetry={() => void query.refetch()} />;
}
export default function HomePage() {
  useDocumentTitle('Streamly — Movie Discovery & Trailers');
  const featured = useFeaturedMovies();
  const trending = useTrendingMovies();
  const recentlyReleased = useRecentlyReleasedMovies();
  const newlyAdded = useNewMovies();
  const genres = useGenres();
  return <>
    <HeroBanner movie={featured.data?.[0]} isLoading={featured.isPending} error={featured.error} onRetry={() => void featured.refetch()} />
    <div className="page-gutter relative pb-6">
      {!!(trending.isPending || trending.error || trending.data?.length) && <MovieRow title="Trending Now" movies={trending.data} isLoading={trending.isPending} error={trending.error} onRetry={() => void trending.refetch()} />}
      <MovieRow title="Newly Added" movies={newlyAdded.data} isLoading={newlyAdded.isPending} error={newlyAdded.error} onRetry={() => void newlyAdded.refetch()} />
      <MovieRow title="Recently Released" movies={recentlyReleased.data} isLoading={recentlyReleased.isPending} error={recentlyReleased.error} onRetry={() => void recentlyReleased.refetch()} />
      {genres.isPending && <MovieRow title="Explore by genre" isLoading />}
      {genres.data?.map((genre) => <GenreRow key={genre.id} genre={genre} />)}
    </div>
  </>;
}
