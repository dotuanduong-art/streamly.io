import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies.api';
import { genresApi } from '@/api/genres.api';
import { queryKeys } from '@/lib/queryKeys';
import { features } from '@/lib/features';
import { paginate } from '@/lib/paginate';
import { isValidMovieId } from '@/lib/movie';
import { normalizeApiError } from '@/lib/error';
import {
  selectFeaturedMovies,
  selectNewMovies,
  selectPublicMovies,
  selectRecentlyReleasedMovies,
  selectTrendingMovies,
} from '../selectors';
import type { MovieDetail } from '@/types';

const publicMovies = async (): Promise<MovieDetail[]> =>
  selectPublicMovies((await moviesApi.getMovies()) as MovieDetail[]);
const listOptions = {
  queryKey: queryKeys.movies.all,
  queryFn: publicMovies,
  networkMode: 'always' as const,
};

export const useFeaturedMovies = () => useQuery({ ...listOptions, select: selectFeaturedMovies });
export const useTrendingMovies = () => useQuery({ ...listOptions, select: selectTrendingMovies });
export const useRecentlyReleasedMovies = () => useQuery({ ...listOptions, select: selectRecentlyReleasedMovies });
export const useNewMovies = () => useQuery({ ...listOptions, select: selectNewMovies });
export const useMoviesByGenre = (id: number, page = 1, pageSize = 20) =>
  useQuery({
    queryKey: queryKeys.genreMovies(id),
    queryFn: async () => selectPublicMovies((await genresApi.getMoviesByGenre(id)) as MovieDetail[]),
    enabled: isValidMovieId(id),
    select: (movies: MovieDetail[]) => paginate(movies, page, pageSize),
    networkMode: 'always',
  });
export const useMovies = (page = 1, pageSize = 20) =>
  useQuery({ ...listOptions, select: (movies: MovieDetail[]) => paginate(movies, page, pageSize) });
export const useSearchMovies = (q: string, page = 1, pageSize = 20, limit = 50) =>
  useQuery({
    queryKey: queryKeys.movies.search(q.trim(), limit),
    queryFn: async () => selectPublicMovies((await moviesApi.searchMovies(q.trim(), limit)) as MovieDetail[]),
    enabled: q.trim().length > 0,
    select: (movies) => paginate(movies, page, pageSize),
    networkMode: 'always',
  });
export const useMovie = (id: number) =>
  useQuery({
    queryKey: queryKeys.movies.detail(id),
    enabled: isValidMovieId(id),
    queryFn: async () => {
      const movie = (await moviesApi.getMovieById(id)) as MovieDetail;
      if (!selectPublicMovies([movie]).length) throw { status: 404, message: 'Movie not found.' };
      return movie;
    },
    retry: (failureCount, error) => normalizeApiError(error).status !== 404 && failureCount < 1,
    networkMode: 'always',
  });
export const useGenres = () =>
  useQuery({ queryKey: queryKeys.genres, queryFn: genresApi.getAllGenres, networkMode: 'always' });

export const useSimilarMovies = (id: number) =>
  useQuery({
    queryKey: queryKeys.movies.similar(id),
    queryFn: async () => selectPublicMovies(await moviesApi.getSimilarMovies(id)),
    enabled: features.similarMoviesAvailable && isValidMovieId(id),
    networkMode: 'always',
  });
