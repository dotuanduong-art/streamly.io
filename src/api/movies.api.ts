import type { Movie, MovieDetail } from '@/types';
import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { mockMovies } from '@/features/movies/mockMovies';
import { normalizeApiError } from '@/lib/error';
import { isValidMovieId } from '@/lib/movie';

async function mockDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw normalizeApiError({ message: 'Unable to connect. Check your connection and try again.' });
  }
}

export const moviesApi = {
  getMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies')).data;
    await mockDelay();
    return mockMovies;
  },
  getMovieById: async (id: number): Promise<Movie> => {
    if (!isValidMovieId(id)) throw { status: 404, message: 'Movie not found.' };
    if (!USE_MOCK) return (await apiClient.get<Movie>(`/movies/${id}`)).data;
    await mockDelay();
    const movie = mockMovies.find((item) => item.id === id);
    if (!movie) throw { status: 404, message: 'Movie not found.' };
    return movie;
  },
  searchMovies: async (q: string): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies/search', { params: { q } })).data;
    await mockDelay();
    return mockMovies.filter((movie) => movie.title.toLowerCase().includes(q.trim().toLowerCase()));
  },
  getSimilarMovies: async (id: number): Promise<MovieDetail[]> => {
    if (!USE_MOCK) return [];
    await mockDelay();
    const genreIds = mockMovies.find((movie) => movie.id === id)?.genres?.map((genre) => genre.id) ?? [];
    return mockMovies
      .filter((movie) => movie.id !== id && movie.genres?.some((genre) => genreIds.includes(genre.id)))
      .slice(0, 6);
  },
};
