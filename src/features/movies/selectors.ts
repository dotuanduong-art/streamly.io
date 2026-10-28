import type { MovieDetail } from '@/types';

// Defensive public filter: backend should also filter hidden movies; confirm with backend.
export const selectPublicMovies = <T extends MovieDetail>(movies: T[]): T[] =>
  movies.filter((movie) => movie.isVisible !== false);
export const selectFeaturedMovies = (movies: MovieDetail[]) => movies.filter((movie) => movie.isFeatured);
export const selectNewMovies = (movies: MovieDetail[]) =>
  [...movies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
// Trending is a quality ranking: highest TMDb rating first.
// Featured status and popularity are only tie-breakers, so a lower-rated
// movie never jumps ahead of a higher-rated movie just for being featured.
const ratingForRank = (movie: MovieDetail): number =>
  typeof movie.voteAverage === 'number' &&
  Number.isFinite(movie.voteAverage) &&
  movie.voteAverage >= 0 &&
  movie.voteAverage <= 10
    ? movie.voteAverage
    : -1;

const popularityForRank = (movie: MovieDetail): number =>
  typeof movie.popularity === 'number' && Number.isFinite(movie.popularity)
    ? movie.popularity
    : 0;

export const selectTrendingMovies = (movies: MovieDetail[]) =>
  movies
    .filter((movie) => movie.isVisible !== false)
    .slice()
    .sort((a, b) => {
      const byRating = ratingForRank(b) - ratingForRank(a);
      if (byRating !== 0) return byRating;

      const byFeatured = Number(b.isFeatured) - Number(a.isFeatured);
      if (byFeatured !== 0) return byFeatured;

      const byPopularity = popularityForRank(b) - popularityForRank(a);
      if (byPopularity !== 0) return byPopularity;

      return b.createdAt.localeCompare(a.createdAt) || a.id - b.id;
    });
export const selectRecentlyReleasedMovies = (movies: MovieDetail[]) =>
  [...movies].sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
