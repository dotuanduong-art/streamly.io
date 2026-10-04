import type { Movie, UpdateMovieRequest } from '@/types';
import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { deleteMockMovie, getMockMovies, resetMockMovies, updateMockMovie } from '@/features/movies/mockMovieStore';

const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 300));
const editable = (movie: Movie): UpdateMovieRequest => ({
  title: movie.title,
  overview: movie.overview,
  releaseDate: movie.releaseDate,
  durationMinutes: movie.durationMinutes,
  posterUrl: movie.posterUrl,
  backdropUrl: movie.backdropUrl,
  trailerKey: movie.trailerKey,
  tmdbId: movie.tmdbId,
  isVisible: movie.isVisible,
  isFeatured: movie.isFeatured,
});

export const adminApi = {
  getAdminMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies')).data;
    await delay();
    return getMockMovies();
  },
  updateMovie: async (id: number, request: UpdateMovieRequest): Promise<Movie> => {
    if (!USE_MOCK) {
      // Request shape is an assumption documented in docs/proposed-api.md.
      return (await apiClient.put<Movie>(`/movies/${id}`, request)).data;
    }
    await delay();
    return updateMockMovie(id, request);
  },
  setMovieVisibility: async (id: number, isVisible: boolean): Promise<Movie> => {
    const current = (await adminApi.getAdminMovies()).find((movie) => movie.id === id);
    if (!current) throw { status: 404, message: 'Movie not found.' };
    return adminApi.updateMovie(id, { ...editable(current), isVisible });
  },
  setMovieFeatured: async (id: number, isFeatured: boolean): Promise<Movie> => {
    const current = (await adminApi.getAdminMovies()).find((movie) => movie.id === id);
    if (!current) throw { status: 404, message: 'Movie not found.' };
    return adminApi.updateMovie(id, { ...editable(current), isFeatured });
  },
  deleteMovie: async (id: number): Promise<void> => {
    if (!USE_MOCK) {
      await apiClient.delete(`/movies/${id}`);
      return;
    }
    await delay();
    deleteMockMovie(id);
  },
  resetDemoData: async (): Promise<void> => {
    if (!USE_MOCK) throw { status: 403, message: 'Demo data reset is only available in mock mode.' };
    await delay();
    resetMockMovies();
  },
};
