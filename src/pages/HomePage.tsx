import { HeroBanner } from '@/components/hero/HeroBanner';
import { MovieRow } from '@/components/movie/MovieRow';
import { useFeaturedMovies, useTrendingMovies, useRecentlyReleasedMovies, useNewMovies, useMoviesByGenre, useGenres } from '@/features/movies/hooks';
import type { Genre } from '@/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function GenreRow({ genre }: { genre: Genre }) {
  const query = useMoviesByGenre(genre.id);
  const stableSlugs = ['action', 'sci-fi', 'drama', 'thriller', 'comedy', 'animation', 'adventure', 'horror'];
  return <MovieRow title={genre.name} testIdSlug={stableSlugs[genre.id - 1] ?? `genre-${genre.id}`} movies={query.data?.items} isLoading={query.isPending} error={query.error} onRetry={() => void query.refetch()} />;
}
export default function HomePage() {
  useDocumentTitle('Streamly — Khám phá phim và trailer');
  const featured = useFeaturedMovies();
  const trending = useTrendingMovies();
  const recentlyReleased = useRecentlyReleasedMovies();
  const newlyAdded = useNewMovies();
  const genres = useGenres();
  return <>
    <HeroBanner movie={featured.data?.[0]} isLoading={featured.isPending} error={featured.error} onRetry={() => void featured.refetch()} />
    <div className="page-gutter relative pb-6">
      {!!(trending.isPending || trending.error || trending.data?.length) && <MovieRow title="Đang thịnh hành" testIdSlug="trending-now" movies={trending.data} isLoading={trending.isPending} error={trending.error} onRetry={() => void trending.refetch()} />}
      <MovieRow title="Mới thêm" testIdSlug="newly-added" movies={newlyAdded.data} isLoading={newlyAdded.isPending} error={newlyAdded.error} onRetry={() => void newlyAdded.refetch()} />
      <MovieRow title="Mới phát hành" testIdSlug="recently-released" movies={recentlyReleased.data} isLoading={recentlyReleased.isPending} error={recentlyReleased.error} onRetry={() => void recentlyReleased.refetch()} />
      {genres.isPending && <MovieRow title="Khám phá theo thể loại" testIdSlug="explore-by-genre" isLoading />}
      {genres.data?.map((genre) => <GenreRow key={genre.id} genre={genre} />)}
    </div>
  </>;
}
