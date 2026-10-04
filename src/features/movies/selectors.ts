import type { MovieDetail } from '@/types';

// Defensive public filter: backend should also filter hidden movies; confirm with backend.
export const selectPublicMovies = <T extends MovieDetail>(movies: T[]): T[] =>
  movies.filter((movie) => movie.isVisible !== false);
export const selectFeaturedMovies = (movies: MovieDetail[]) => movies.filter((movie) => movie.isFeatured);
export const selectNewMovies = (movies: MovieDetail[]) =>
  [...movies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const selectTrendingMovies = (movies: MovieDetail[]) =>
  movies.filter((movie) => movie.popularity != null).sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
export const selectRecentlyReleasedMovies = (movies: MovieDetail[]) =>
  [...movies].sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
