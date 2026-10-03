import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { mockGenres } from '@/features/movies/mockMovies';
import type { Genre } from '@/types';

export const genresApi = {
  getAllGenres: async (): Promise<Genre[]> => {
    if (!USE_MOCK) return (await apiClient.get<Genre[]>('/genres')).data;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockGenres;
  },
};
