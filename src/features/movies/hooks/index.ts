import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies.api';
import { genresApi } from '@/api/genres.api';
import { queryKeys } from '@/lib/queryKeys';

export const useFeaturedMovies = () => useQuery({ queryKey: queryKeys.movies.featured, queryFn: moviesApi.getFeaturedMovies });
export const useTrendingMovies = () => useQuery({ queryKey: queryKeys.movies.trending, queryFn: moviesApi.getTrendingMovies });
export const useNewMovies = () => useQuery({ queryKey: queryKeys.movies.new, queryFn: moviesApi.getNewMovies });
export const useMoviesByGenre = (id: number) => useQuery({ queryKey: queryKeys.movies.genre(id), queryFn: () => moviesApi.getMoviesByGenre(id) });
export const useGenres = () => useQuery({ queryKey: queryKeys.genres, queryFn: genresApi.getAllGenres });
