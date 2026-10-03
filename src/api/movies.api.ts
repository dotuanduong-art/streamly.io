import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { Movie, PaginationResponse, PaginationParams } from '@/types';
import { mockMovies } from '@/features/movies/mockMovies';

const SIMULATED_DELAY = 200; // ms to simulate network call

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const moviesApi = {
  getFeaturedMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies/featured')).data;
    await delay(SIMULATED_DELAY);
    const featured = mockMovies.filter((m) => m.isFeatured);
    return featured;
  },

  getTrendingMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies/trending')).data;
    await delay(SIMULATED_DELAY);
    return mockMovies.filter((m) => m.isTrending);
  },

  getNewMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>('/movies/new')).data;
    await delay(SIMULATED_DELAY);
    return mockMovies.filter((m) => m.isNew);
  },

  getMovieById: async (id: number): Promise<Movie> => {
    if (!USE_MOCK) return (await apiClient.get<Movie>(`/movies/${id}`)).data;
    await delay(SIMULATED_DELAY);
    const movie = mockMovies.find((m) => m.id === Number(id));
    if (!movie) {
      throw new Error(`Movie with ID ${id} not found.`);
    }
    return movie;
  },

  searchMovies: async (
    query: string,
    params: PaginationParams = {}
  ): Promise<PaginationResponse<Movie>> => {
    await delay(SIMULATED_DELAY);
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    if (!USE_MOCK) return (await apiClient.get<PaginationResponse<Movie>>('/movies', { params: { ...params, q: query } })).data;
    const normalizedQuery = query.toLowerCase().trim();
    const filtered = mockMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(normalizedQuery) ||
        m.overview.toLowerCase().includes(normalizedQuery) ||
        m.genres.some((g) => g.name.toLowerCase().includes(normalizedQuery))
    );

    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  },

  getMoviesByGenre: async (
    genreId: number,
    params: PaginationParams = {}
  ): Promise<PaginationResponse<Movie>> => {
    await delay(SIMULATED_DELAY);
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    if (!USE_MOCK) return (await apiClient.get<PaginationResponse<Movie>>('/movies', { params: { ...params, genreId } })).data;
    const filtered = mockMovies.filter((m) =>
      m.genres.some((g) => g.id === Number(genreId))
    );

    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  },

  getSimilarMovies: async (movieId: number): Promise<Movie[]> => {
    if (!USE_MOCK) return (await apiClient.get<Movie[]>(`/movies/${movieId}/similar`)).data;
    await delay(SIMULATED_DELAY);
    const targetMovie = mockMovies.find((m) => m.id === Number(movieId));
    if (!targetMovie) return mockMovies.slice(0, 4);

    const targetGenreIds = targetMovie.genres.map((g) => g.id);
    return mockMovies
      .filter((m) => m.id !== Number(movieId))
      .filter((m) => m.genres.some((g) => targetGenreIds.includes(g.id)))
      .slice(0, 6);
  },

};

