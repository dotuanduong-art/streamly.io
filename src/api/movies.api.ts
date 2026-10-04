import type { Movie, MovieDetail } from '@/types';
import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { isValidMovieId } from '@/lib/movie';
import { mockMoviesApi } from '@/mocks/movies/api';

export const moviesApi = {
  getMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies')).data;
    return mockMoviesApi.getMovies();
  },
  getMovieById: async (id: number): Promise<Movie> => {
    if (!isValidMovieId(id)) throw { status: 404, message: 'Movie not found.' };
    if (!USE_MOCK) return (await apiClient.get<Movie>(`/movies/${id}`)).data;
    return mockMoviesApi.getMovieById(id);
  },
  searchMovies: async (q: string, limit: number): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies/search', { params: { q, limit } })).data;
    return mockMoviesApi.searchMovies(q, limit);
  },
  getSimilarMovies: async (id: number): Promise<MovieDetail[]> => {
    if (!USE_MOCK) return [];
    return mockMoviesApi.getSimilarMovies(id);
  },
};
