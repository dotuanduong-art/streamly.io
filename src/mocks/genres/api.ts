import type { Genre, Movie } from '@/types';
import { mockGenres } from '@/mocks/movies/data';
import { getMockMovies } from '@/mocks/movies/store';

const delay = async () => {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 200));
  if (!navigator.onLine) throw { message: 'Không thể kết nối. Hãy kiểm tra đường truyền và thử lại.' };
};

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
