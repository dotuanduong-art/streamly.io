import type { Genre, Movie } from '@/types';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from './client';
import { mockGenresApi } from '@/mocks/genres/api';

export const genresApi = {
  getAllGenres: async (): Promise<Genre[]> => {
    if (!USE_MOCK) return (await apiClient.get<Genre[]>('/genres')).data;
    return mockGenresApi.getAllGenres();
  },
  getMoviesByGenre: async (id: number): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>(`/genres/${id}/movies`)).data;
    return mockGenresApi.getMoviesByGenre(id);
  },
};

