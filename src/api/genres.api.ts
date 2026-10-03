import { mockGenres } from '@/features/movies/mockMovies';
import type { Genre } from '@/types';

export const genresApi = {
  getAllGenres: async (): Promise<Genre[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockGenres;
  },
};

