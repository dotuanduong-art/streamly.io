import { mockGenres } from '@/features/movies/mockMovies';
import { getMockMovies } from '@/features/movies/mockMovieStore';
import type { Genre, Movie } from '@/types';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from './client';

const mockDelay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 200));

export const genresApi = {
  getAllGenres: async (): Promise<Genre[]> => {
    if (!USE_MOCK) return (await apiClient.get<Genre[]>('/genres')).data;
    await mockDelay();
    return mockGenres;
  },
  getMoviesByGenre: async (id: number): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>(`/genres/${id}/movies`)).data;
    await mockDelay();
    return getMockMovies().filter((movie) => movie.genres?.some((genre) => genre.id === id));
  },
};

