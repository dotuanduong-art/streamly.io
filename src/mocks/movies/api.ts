import type { Movie, MovieDetail } from '@/types';
import { normalizeApiError } from '@/lib/error';
import { isValidMovieId } from '@/lib/movie';
import { getMockMovies } from './store';

async function delay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw normalizeApiError({ message: 'Unable to connect. Check your connection and try again.' });
  }
}

export const mockMoviesApi = {
  getMovies: async (): Promise<Movie[]> => {
    await delay();
    return getMockMovies();
  },
  getMovieById: async (id: number): Promise<Movie> => {
    if (!isValidMovieId(id)) throw { status: 404, message: 'Movie not found.' };
    await delay();
    const movie = getMockMovies().find((item) => item.id === id);
    if (!movie) throw { status: 404, message: 'Movie not found.' };
    return movie;
  },
  searchMovies: async (q: string, limit: number): Promise<Movie[]> => {
    await delay();
    return getMockMovies().filter((movie) => movie.title.toLowerCase().includes(q.trim().toLowerCase())).slice(0, limit);
  },
  getSimilarMovies: async (id: number): Promise<MovieDetail[]> => {
    await delay();
    const movies = getMockMovies();
    const genreIds = movies.find((movie) => movie.id === id)?.genres?.map((genre) => genre.id) ?? [];
    return movies.filter((movie) => movie.id !== id && movie.genres?.some((genre) => genreIds.includes(genre.id))).slice(0, 6);
  },
};
