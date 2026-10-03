import type { MovieDetail } from '@/types';

// Defensive public filter: backend should also filter hidden movies; confirm with backend.
export const selectPublicMovies = <T extends MovieDetail>(movies: T[]): T[] =>
  movies.filter((movie) => movie.isVisible !== false);
export const selectFeaturedMovies = (movies: MovieDetail[]) => movies.filter((movie) => movie.isFeatured);
export const selectNewMovies = (movies: MovieDetail[]) =>
  [...movies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
// TODO: "Trending" needs a backend popularity field. Release date is the temporary public selector.
export const selectRecentlyReleasedMovies = (movies: MovieDetail[]) =>
  [...movies].sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
export const selectMoviesByGenre = (movies: MovieDetail[], id: number) =>
  movies.filter((movie) => movie.genres?.some((genre) => genre.id === id));
