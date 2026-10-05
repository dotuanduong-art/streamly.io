import type {
  AdminUsersResponse,
  CreateMovieRequest,
  Genre,
  Movie,
  UpdateMovieRequest,
  UserRole,
} from '@/types';

import { apiClient } from './client';
import { USE_MOCK } from '@/lib/constants';
import { mockAdminApi } from '@/mocks/admin/api';

export interface CreateGenreRequest {
  tmdbId?: number | null;
  name: string;
}

export interface UpdateGenreRequest {
  tmdbId?: number | null;
  name: string;
}

export interface AdminUsersParams {
  q?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

const editable = (
  movie: Movie
): UpdateMovieRequest => ({
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

export const adminApi = {
  getAdminMovies: async (): Promise<Movie[]> => {
    if (!USE_MOCK) {
      throw {
        status: 503,
        message:
          'API danh sách phim quản trị chưa khả dụng.',
      };
    }

    return mockAdminApi.getAdminMovies();
  },

  createMovie: async (
    request: CreateMovieRequest
  ): Promise<Movie> => {
    if (!USE_MOCK) {
      return (
        await apiClient.post<Movie>(
          '/movies',
          request
        )
      ).data;
    }

    return mockAdminApi.createMovie(request);
  },

  updateMovie: async (
    id: number,
    request: UpdateMovieRequest
  ): Promise<void> => {
    if (!USE_MOCK) {
      await apiClient.put<void>(
        `/movies/${id}`,
        request
      );

      return;
    }

    return mockAdminApi.updateMovie(
      id,
      request
    );
  },

  setMovieVisibility: async (
    id: number,
    isVisible: boolean
  ): Promise<void> => {
    if (USE_MOCK) {
      return mockAdminApi.setMovieVisibility(
        id,
        isVisible
      );
    }

    const current = (
      await adminApi.getAdminMovies()
    ).find(
      (movie) => movie.id === id
    );

    if (!current) {
      throw {
        status: 404,
        message: 'Không tìm thấy phim.',
      };
    }

    return adminApi.updateMovie(id, {
      ...editable(current),
      isVisible,
    });
  },

  setMovieFeatured: async (
    id: number,
    isFeatured: boolean
  ): Promise<void> => {
    if (USE_MOCK) {
      return mockAdminApi.setMovieFeatured(
        id,
        isFeatured
      );
    }

    const current = (
      await adminApi.getAdminMovies()
    ).find(
      (movie) => movie.id === id
    );

    if (!current) {
      throw {
        status: 404,
        message: 'Không tìm thấy phim.',
      };
    }

    return adminApi.updateMovie(id, {
      ...editable(current),
      isFeatured,
    });
  },

  deleteMovie: async (
    id: number
  ): Promise<void> => {
    if (!USE_MOCK) {
      await apiClient.delete(
        `/movies/${id}`
      );

      return;
    }

    return mockAdminApi.deleteMovie(id);
  },

getAdminGenres: async (): Promise<Genre[]> => {
  if (!USE_MOCK) {
    return (
      await apiClient.get<Genre[]>(
        '/admin/genres'
      )
    ).data;
  }

  return mockAdminApi.getAdminGenres();
},

createGenre: async (
  request: CreateGenreRequest
): Promise<Genre> => {
  if (!USE_MOCK) {
    return (
      await apiClient.post<Genre>(
        '/admin/genres',
        request
      )
    ).data;
  }

  return mockAdminApi.createGenre(request);
},

updateGenre: async (
  id: number,
  request: UpdateGenreRequest
): Promise<void> => {
  if (!USE_MOCK) {
    await apiClient.put<void>(
      `/admin/genres/${id}`,
      request
    );

    return;
  }

  return mockAdminApi.updateGenre(
  id,
  request
  );
},

deleteGenre: async (
  id: number
): Promise<void> => {
  if (!USE_MOCK) {
    await apiClient.delete(
      `/admin/genres/${id}`
    );

    return;
  }

  return mockAdminApi.deleteGenre(id);
},

getAdminUsers: async (
  params: AdminUsersParams = {}
): Promise<AdminUsersResponse> => {
  if (!USE_MOCK) {
    return (
      await apiClient.get<AdminUsersResponse>(
        '/admin/users',
        {
          params: {
            q: params.q || undefined,
            role: params.role || undefined,
            isActive: params.isActive,
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 10,
          },
        }
      )
    ).data;
  }

  return mockAdminApi.getAdminUsers(params);
},

updateUserRole: async (
  id: number,
  role: UserRole
): Promise<void> => {
  if (!USE_MOCK) {
    await apiClient.put<void>(
      `/admin/users/${id}/role`,
      { role }
    );

    return;
  }

  return mockAdminApi.updateUserRole(
  id,
  role
  );
},

updateUserStatus: async (
  id: number,
  isActive: boolean
): Promise<void> => {
  if (!USE_MOCK) {
    await apiClient.put<void>(
      `/admin/users/${id}/status`,
      { isActive }
    );

    return;
  }

  return mockAdminApi.updateUserStatus(
    id,
    isActive
  );
},

importTmdbMovie: async (
  tmdbId: number
): Promise<Movie> => {
  if (!USE_MOCK) {
    return (
      await apiClient.post<Movie>(
        `/admin/tmdb/import/${tmdbId}`
      )
    ).data;
  }

  throw {
    status: 503,
    message:
      'TMDB Import chỉ hoạt động khi kết nối Backend thật.',
  };
},

  resetDemoData:
    async (): Promise<void> => {
      if (!USE_MOCK) {
        throw {
          status: 403,
          message:
            'Chỉ có thể đặt lại dữ liệu mẫu trong chế độ mock.',
        };
      }

      return mockAdminApi.resetDemoData();
    },
};