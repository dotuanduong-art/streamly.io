import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Movie, UserRole } from '@/types';
import { adminApi } from '@/api/admin.api';
import { normalizeApiError } from '@/lib/error';
import { queryKeys } from '@/lib/queryKeys';
import { features } from '@/lib/features';

function useInvalidateMovieQueries() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMovies }),
      queryClient.invalidateQueries({ predicate: ({ queryKey }) => ['movies', 'movie', 'genres', 'my-list', 'history'].includes(String(queryKey[0])) }),
    ]);
  };
}

export function useAdminMovies() {
  return useQuery({ queryKey: queryKeys.adminMovies, queryFn: adminApi.getAdminMovies, enabled: features.adminMoviesApiAvailable, networkMode: 'always' });
}

function useOptimisticMovieMutation(field: 'isVisible' | 'isFeatured', mutationFn: (variables: { id: number; value: boolean }) => Promise<void>) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMovieQueries();
  return useMutation({
    mutationFn,
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.adminMovies });
      const previous = queryClient.getQueryData<Movie[]>(queryKeys.adminMovies);
      queryClient.setQueryData<Movie[]>(queryKeys.adminMovies, (movies = []) => movies.map((movie) =>
        movie.id === id ? { ...movie, [field]: value } : movie));
      return { previous };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(queryKeys.adminMovies, context?.previous);
      toast.error(normalizeApiError(error).message);
    },
    onSettled: invalidate,
  });
}

const visibilityMutation = ({ id, value }: { id: number; value: boolean }) => adminApi.setMovieVisibility(id, value);
const featuredMutation = ({ id, value }: { id: number; value: boolean }) => adminApi.setMovieFeatured(id, value);

export const useSetMovieVisibility = () => useOptimisticMovieMutation('isVisible', visibilityMutation);
export const useSetMovieFeatured = () => useOptimisticMovieMutation('isFeatured', featuredMutation);

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMovieQueries();
  return useMutation({
    mutationFn: adminApi.deleteMovie,
    onSuccess: (_result, id) => queryClient.setQueryData<Movie[]>(queryKeys.adminMovies, (movies = []) => movies.filter((movie) => movie.id !== id)),
    onError: (error, id) => {
      const normalized = normalizeApiError(error);
      if (normalized.status === 404) queryClient.setQueryData<Movie[]>(queryKeys.adminMovies, (movies = []) => movies.filter((movie) => movie.id !== id));
      else toast.error(normalized.message);
    },
    onSettled: invalidate,
  });
}

export function useResetDemoMovies() {
  const invalidate = useInvalidateMovieQueries();
  return useMutation({
    mutationFn: adminApi.resetDemoData,
    onSuccess: () => toast.success('Đã khôi phục dữ liệu phim mẫu.'),
    onError: (error) => toast.error(normalizeApiError(error).message),
    onSettled: invalidate,
  });
}

export function useAdminGenres() {
  return useQuery({
    queryKey: ['admin', 'genres'],
    queryFn: adminApi.getAdminGenres,
    networkMode: 'always',
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.createGenre,

    onSuccess: async () => {
      toast.success('Đã thêm thể loại.');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['admin', 'genres'],
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.genres,
        }),
      ]);
    },

    onError: (error) => {
      toast.error(
        normalizeApiError(error).message
      );
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      tmdbId,
    }: {
      id: number;
      name: string;
      tmdbId?: number | null;
    }) =>
      adminApi.updateGenre(id, {
        name,
        tmdbId,
      }),

    onSuccess: async () => {
      toast.success('Đã cập nhật thể loại.');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['admin', 'genres'],
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.genres,
        }),
      ]);
    },

    onError: (error) => {
      toast.error(
        normalizeApiError(error).message
      );
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteGenre,

    onSuccess: async () => {
      toast.success('Đã xóa thể loại.');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['admin', 'genres'],
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.genres,
        }),
      ]);
    },

    onError: (error) => {
      toast.error(
        normalizeApiError(error).message
      );
    },
  });
}

export function useAdminUsers(params: {
  q?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () =>
      adminApi.getAdminUsers(params),
    networkMode: 'always',
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: number;
      role: UserRole;
    }) =>
      adminApi.updateUserRole(id, role),

    onSuccess: async () => {
      toast.success(
        'Đã cập nhật quyền người dùng.'
      );

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },

    onError: (error) => {
      toast.error(
        normalizeApiError(error).message
      );
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: number;
      isActive: boolean;
    }) =>
      adminApi.updateUserStatus(
        id,
        isActive
      ),

    onSuccess: async (
      _result,
      variables
    ) => {
      toast.success(
        variables.isActive
          ? 'Đã mở khóa tài khoản.'
          : 'Đã khóa tài khoản.'
      );

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });
    },

    onError: (error) => {
      toast.error(
        normalizeApiError(error).message
      );
    },
  });
}

export function useImportTmdbMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.importTmdbMovie,

    onSuccess: async () => {
      toast.success(
        'Đã import phim từ TMDB.'
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.adminMovies,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            ['movies', 'movie', 'genres'].includes(
              String(queryKey[0])
            ),
        }),
      ]);
    },

    onError: (error) => {
      toast.error(
        normalizeApiError(error).message
      );
    },
  });
}