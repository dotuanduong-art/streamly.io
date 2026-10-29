import type { Movie, MovieDetail } from '@/types';
import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { isValidMovieId } from '@/lib/movie';
import { mockMoviesApi } from '@/mocks/movies/api';
import { genresApi } from './genres.api';
import { localizeMovieGenres } from '@/lib/genre';

export const moviesApi = {
  getGenres: genresApi.getAllGenres,
  getMoviesByGenre: genresApi.getMoviesByGenre,
  getMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies')).data.map(localizeMovieGenres);
    return mockMoviesApi.getMovies();
  },
  getMovieById: async (id: number): Promise<Movie> => {
    if (!isValidMovieId(id)) throw { status: 404, message: 'Không tìm thấy phim.' };
    if (!USE_MOCK) return localizeMovieGenres((await apiClient.get<Movie>(`/movies/${id}`)).data);
    return mockMoviesApi.getMovieById(id);
  },
  searchMovies: async (q: string, limit: number): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies/search', { params: { q, limit } })).data.map(localizeMovieGenres);
    return mockMoviesApi.searchMovies(q, limit);
  },
  getSimilarMovies: async (id: number): Promise<MovieDetail[]> => {
    if (!USE_MOCK) return [];
    return mockMoviesApi.getSimilarMovies(id);
  },
};
