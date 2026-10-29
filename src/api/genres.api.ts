import type { Genre, Movie } from '@/types';
import { USE_MOCK } from '@/lib/constants';
import { apiClient } from './client';
import { mockGenresApi } from '@/mocks/genres/api';
import { localizeGenre, localizeMovieGenres } from '@/lib/genre';

export const genresApi = {
  getAllGenres: async (): Promise<Genre[]> => {
    const genres = USE_MOCK ? await mockGenresApi.getAllGenres() : (await apiClient.get<Genre[]>('/genres')).data;
    return genres.map(localizeGenre);
  },
  getMoviesByGenre: async (id: number): Promise<Movie[]> => {
    const movies = USE_MOCK ? await mockGenresApi.getMoviesByGenre(id) : (await apiClient.get<Movie[]>(`/genres/${id}/movies`)).data;
    return movies.map(localizeMovieGenres);
  },
};

