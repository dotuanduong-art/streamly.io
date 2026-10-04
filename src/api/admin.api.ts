import type { Movie, UpdateMovieRequest } from '@/types';
import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { mockAdminApi } from '@/mocks/admin/api';

const editable = (movie: Movie): UpdateMovieRequest => ({
  title: movie.title,
  overview: movie.overview,
  releaseDate: movie.releaseDate,
  durationMinutes: movie.durationMinutes,
  posterUrl: movie.posterUrl,
  backdropUrl: movie.backdropUrl,
  trailerKey: movie.trailerKey,
  isVisible: movie.isVisible,
  isFeatured: movie.isFeatured,
  voteAverage: movie.voteAverage,
  popularity: movie.popularity,
});

export const adminApi = {
  getAdminMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) throw { status: 503, message: 'Admin movie list API is not available yet' };
    return mockAdminApi.getAdminMovies();
  },
  updateMovie: async (id: number, request: UpdateMovieRequest): Promise<void> => {
    if (!USE_MOCK) {
      await apiClient.put<void>(`/movies/${id}`, request);
      return;
    }
    return mockAdminApi.updateMovie(id, request);
  },
  setMovieVisibility: async (id: number, isVisible: boolean): Promise<void> => {
    if (USE_MOCK) return mockAdminApi.setMovieVisibility(id, isVisible);
    const current = (await adminApi.getAdminMovies()).find((movie) => movie.id === id);
    if (!current) throw { status: 404, message: 'Movie not found.' };
    return adminApi.updateMovie(id, { ...editable(current), isVisible });
  },
  setMovieFeatured: async (id: number, isFeatured: boolean): Promise<void> => {
    if (USE_MOCK) return mockAdminApi.setMovieFeatured(id, isFeatured);
    const current = (await adminApi.getAdminMovies()).find((movie) => movie.id === id);
    if (!current) throw { status: 404, message: 'Movie not found.' };
    return adminApi.updateMovie(id, { ...editable(current), isFeatured });
  },
  deleteMovie: async (id: number): Promise<void> => {
    if (!USE_MOCK) {
      await apiClient.delete(`/movies/${id}`);
      return;
    }
    return mockAdminApi.deleteMovie(id);
  },
  resetDemoData: async (): Promise<void> => {
    if (!USE_MOCK) throw { status: 403, message: 'Demo data reset is only available in mock mode.' };
    return mockAdminApi.resetDemoData();
  },
};
