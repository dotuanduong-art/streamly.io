import type { Movie, UpdateMovieRequest } from '@/types';
import { deleteMockMovie, getMockMovies, resetMockMovies, updateMockMovie } from '@/mocks/movies/store';

const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 300));
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

export const mockAdminApi = {
  getAdminMovies: async (): Promise<Movie[]> => { await delay(); return getMockMovies(); },
  updateMovie: async (id: number, request: UpdateMovieRequest): Promise<void> => { await delay(); updateMockMovie(id, request); },
  setMovieVisibility: async (id: number, isVisible: boolean): Promise<void> => {
    const current = getMockMovies().find((movie) => movie.id === id);
    if (!current) throw { status: 404, message: 'Movie not found.' };
    await delay();
    updateMockMovie(id, { ...editable(current), isVisible });
  },
  setMovieFeatured: async (id: number, isFeatured: boolean): Promise<void> => {
    const current = getMockMovies().find((movie) => movie.id === id);
    if (!current) throw { status: 404, message: 'Movie not found.' };
    await delay();
    updateMockMovie(id, { ...editable(current), isFeatured });
  },
  deleteMovie: async (id: number): Promise<void> => { await delay(); deleteMockMovie(id); },
  resetDemoData: async (): Promise<void> => { await delay(); resetMockMovies(); },
};
