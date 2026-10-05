import type {
  AdminUser,
  AdminUsersResponse,
  CreateMovieRequest,
  Genre,
  Movie,
  UpdateMovieRequest,
  UserRole,
} from '@/types';

import {
  createMockMovie,
  deleteMockMovie,
  getMockMovies,
  resetMockMovies,
  updateMockMovie,
} from '@/mocks/movies/store';

import { mockGenres } from '@/mocks/movies/data';

const delay = () =>
  new Promise<void>((resolve) =>
    window.setTimeout(resolve, 300)
  );

  const getNextGenreId = (): number => {
  if (mockGenres.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...mockGenres.map((genre) => genre.id)
    ) + 1
  );
};

const createMockGenre = (
  name: string,
  tmdbId?: number | null
): Genre => {
  const trimmedName = name.trim();

  const duplicateName = mockGenres.some(
    (genre) =>
      genre.name.toLowerCase() ===
      trimmedName.toLowerCase()
  );

  if (duplicateName) {
    throw {
      status: 409,
      message: 'Tên thể loại đã tồn tại.',
    };
  }

  if (
    tmdbId != null &&
    mockGenres.some(
      (genre) => genre.tmdbId === tmdbId
    )
  ) {
    throw {
      status: 409,
      message: 'TMDB ID của thể loại đã tồn tại.',
    };
  }

  const genre: Genre = {
    id: getNextGenreId(),
    tmdbId: tmdbId ?? null,
    name: trimmedName,
  };

  mockGenres.push(genre);

  return genre;
};

const updateMockGenre = (
  id: number,
  name: string,
  tmdbId?: number | null
): void => {
  const genre = mockGenres.find(
    (item) => item.id === id
  );

  if (!genre) {
    throw {
      status: 404,
      message: 'Không tìm thấy thể loại.',
    };
  }

  const trimmedName = name.trim();

  const duplicateName = mockGenres.some(
    (item) =>
      item.id !== id &&
      item.name.toLowerCase() ===
        trimmedName.toLowerCase()
  );

  if (duplicateName) {
    throw {
      status: 409,
      message: 'Tên thể loại đã tồn tại.',
    };
  }

  if (
    tmdbId != null &&
    mockGenres.some(
      (item) =>
        item.id !== id &&
        item.tmdbId === tmdbId
    )
  ) {
    throw {
      status: 409,
      message: 'TMDB ID của thể loại đã tồn tại.',
    };
  }

  genre.name = trimmedName;
  genre.tmdbId = tmdbId ?? null;
};

const deleteMockGenre = (
  id: number
): void => {
  const index = mockGenres.findIndex(
    (genre) => genre.id === id
  );

  if (index === -1) {
    throw {
      status: 404,
      message: 'Không tìm thấy thể loại.',
    };
  }

  const isUsed = getMockMovies().some(
    (movie) =>
      movie.genres?.some(
        (genre) => genre.id === id
      )
  );

  if (isUsed) {
    throw {
      status: 409,
      message:
        'Không thể xóa thể loại đang được gán cho phim.',
    };
  }

  mockGenres.splice(index, 1);
};

const ADMIN_USERS_KEY =
  'streamly_mock_admin_users';

const seededAdminUsers: AdminUser[] = [
  {
    id: 1,
    email: 'user@streamly.test',
    displayName: 'Người dùng mẫu',
    avatarUrl: null,
    role: 'User',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'admin@streamly.test',
    displayName: 'Quản trị mẫu',
    avatarUrl: null,
    role: 'Admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    email: 'long@streamly.test',
    displayName: 'Long',
    avatarUrl: null,
    role: 'User',
    isActive: true,
    createdAt: '2026-03-12T08:30:00Z',
  },
  {
    id: 4,
    email: 'demo@streamly.test',
    displayName: 'Tài khoản Demo',
    avatarUrl: null,
    role: 'User',
    isActive: false,
    createdAt: '2026-04-20T10:15:00Z',
  },
  {
    id: 5,
    email: 'manager@streamly.test',
    displayName: 'Quản trị viên 2',
    avatarUrl: null,
    role: 'Admin',
    isActive: true,
    createdAt: '2026-05-05T07:00:00Z',
  },
];

const readMockAdminUsers = (): AdminUser[] => {
  const stored = localStorage.getItem(
    ADMIN_USERS_KEY
  );

  if (!stored) {
    const initialUsers =
      seededAdminUsers.map((user) => ({
        ...user,
      }));

    localStorage.setItem(
      ADMIN_USERS_KEY,
      JSON.stringify(initialUsers)
    );

    return initialUsers;
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return seededAdminUsers.map(
        (user) => ({ ...user })
      );
    }

    return parsed as AdminUser[];
  } catch {
    return seededAdminUsers.map(
      (user) => ({ ...user })
    );
  }
};

const saveMockAdminUsers = (
  users: AdminUser[]
): void => {
  localStorage.setItem(
    ADMIN_USERS_KEY,
    JSON.stringify(users)
  );
};

const getMockAdminUsers = (
  params: {
    q?: string;
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): AdminUsersResponse => {
  const users = readMockAdminUsers();

  const keyword =
    params.q?.trim().toLowerCase() ?? '';

  let filtered = users.filter((user) => {
    const matchesKeyword =
      !keyword ||
      user.email
        .toLowerCase()
        .includes(keyword) ||
      user.displayName
        .toLowerCase()
        .includes(keyword);

    const matchesRole =
      !params.role ||
      user.role === params.role;

    const matchesStatus =
      params.isActive === undefined ||
      user.isActive === params.isActive;

    return (
      matchesKeyword &&
      matchesRole &&
      matchesStatus
    );
  });

  filtered = filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const page = Math.max(
    1,
    params.page ?? 1
  );

  const pageSize = Math.max(
    1,
    params.pageSize ?? 10
  );

  const totalItems = filtered.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

  const start =
    (page - 1) * pageSize;

  return {
    items: filtered.slice(
      start,
      start + pageSize
    ),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
};

const updateMockUserRole = (
  id: number,
  role: UserRole
): void => {
  const users = readMockAdminUsers();

  const user = users.find(
    (item) => item.id === id
  );

  if (!user) {
    throw {
      status: 404,
      message:
        'Không tìm thấy người dùng.',
    };
  }

  user.role = role;

  saveMockAdminUsers(users);
};

const updateMockUserStatus = (
  id: number,
  isActive: boolean
): void => {
  const users = readMockAdminUsers();

  const user = users.find(
    (item) => item.id === id
  );

  if (!user) {
    throw {
      status: 404,
      message:
        'Không tìm thấy người dùng.',
    };
  }

  user.isActive = isActive;

  saveMockAdminUsers(users);
};

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

export const mockAdminApi = {
  getAdminMovies: async (): Promise<Movie[]> => {
    await delay();

    return getMockMovies();
  },

  createMovie: async (
    request: CreateMovieRequest
  ): Promise<Movie> => {
    await delay();

    return createMockMovie(request);
  },

  updateMovie: async (
    id: number,
    request: UpdateMovieRequest
  ): Promise<void> => {
    await delay();

    updateMockMovie(id, request);
  },

  setMovieVisibility: async (
    id: number,
    isVisible: boolean
  ): Promise<void> => {
    const current = getMockMovies().find(
      (movie) => movie.id === id
    );

    if (!current) {
      throw {
        status: 404,
        message: 'Không tìm thấy phim.',
      };
    }

    await delay();

    updateMockMovie(id, {
      ...editable(current),
      isVisible,
    });
  },

  setMovieFeatured: async (
    id: number,
    isFeatured: boolean
  ): Promise<void> => {
    const current = getMockMovies().find(
      (movie) => movie.id === id
    );

    if (!current) {
      throw {
        status: 404,
        message: 'Không tìm thấy phim.',
      };
    }

    await delay();

    updateMockMovie(id, {
      ...editable(current),
      isFeatured,
    });
  },

  deleteMovie: async (
    id: number
  ): Promise<void> => {
    await delay();

    deleteMockMovie(id);
  },

  getAdminGenres: async (): Promise<Genre[]> => {
  await delay();

  return mockGenres.map((genre) => ({
    ...genre,
  }));
},

createGenre: async (
  request: {
    name: string;
    tmdbId?: number | null;
  }
): Promise<Genre> => {
  await delay();

  return createMockGenre(
    request.name,
    request.tmdbId
  );
},

updateGenre: async (
  id: number,
  request: {
    name: string;
    tmdbId?: number | null;
  }
): Promise<void> => {
  await delay();

  updateMockGenre(
    id,
    request.name,
    request.tmdbId
  );
},

deleteGenre: async (
  id: number
): Promise<void> => {
  await delay();

  deleteMockGenre(id);
},
getAdminUsers: async (
  params: {
    q?: string;
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<AdminUsersResponse> => {
  await delay();

  return getMockAdminUsers(params);
},

updateUserRole: async (
  id: number,
  role: UserRole
): Promise<void> => {
  await delay();

  updateMockUserRole(id, role);
},

updateUserStatus: async (
  id: number,
  isActive: boolean
): Promise<void> => {
  await delay();

  updateMockUserStatus(
    id,
    isActive
  );
},
  resetDemoData: async (): Promise<void> => {
    await delay();

    resetMockMovies();
  },
};