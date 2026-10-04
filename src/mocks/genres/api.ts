import type { Genre, Movie } from '@/types';
import { mockGenres } from '@/mocks/movies/data';
import { getMockMovies } from '@/mocks/movies/store';

const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 200));

export const mockGenresApi = {
  getAllGenres: async (): Promise<Genre[]> => {
    await delay();
    return mockGenres;
  },
  getMoviesByGenre: async (id: number): Promise<Movie[]> => {
    await delay();
    return getMockMovies().filter((movie) => movie.genres?.some((genre) => genre.id === id));
  },
};
