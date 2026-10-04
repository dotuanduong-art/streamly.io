import type {
  CreateMovieRequest,
  MovieDetail,
  UpdateMovieRequest,
} from '@/types';

import { mockMovies } from './data';

const OVERRIDES_KEY = 'streamly_mock_movies_overrides';
const DELETIONS_KEY = 'streamly_mock_movies_deletions';
const CREATED_KEY = 'streamly_mock_movies_created';

type MovieOverride = Partial<UpdateMovieRequest> & {
  updatedAt: string;
};

function readOverrides(): Record<string, MovieOverride> {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(OVERRIDES_KEY) ?? '{}'
    );

    return parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
      ? (parsed as Record<string, MovieOverride>)
      : {};
  } catch {
    return {};
  }
}

function readDeletions(): number[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(DELETIONS_KEY) ?? '[]'
    );

    return Array.isArray(parsed)
      ? parsed.filter(
          (id): id is number =>
            typeof id === 'number'
        )
      : [];
  } catch {
    return [];
  }
}

function readCreated(): MovieDetail[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(CREATED_KEY) ?? '[]'
    );

    return Array.isArray(parsed)
      ? (parsed as MovieDetail[])
      : [];
  } catch {
    return [];
  }
}

export function getMockMovies(): MovieDetail[] {
  const overrides = readOverrides();
  const deleted = new Set(readDeletions());

  const allMovies = [
    ...mockMovies,
    ...readCreated(),
  ];

  return allMovies
    .filter((movie) => !deleted.has(movie.id))
    .map((movie) => ({
      ...movie,
      ...overrides[String(movie.id)],
    }));
}

export function createMockMovie(
  request: CreateMovieRequest
): MovieDetail {
  const movies = getMockMovies();

  const duplicate = movies.some(
    (movie) => movie.tmdbId === request.tmdbId
  );

  if (duplicate) {
    throw {
      status: 409,
      message: 'TMDB ID này đã tồn tại.',
    };
  }

  const nextId =
    Math.max(
      0,
      ...movies.map((movie) => movie.id)
    ) + 1;

  const now = new Date().toISOString();

  const movie: MovieDetail = {
    ...request,
    id: nextId,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
    genres: [],
    cast: [],
  };

  const created = readCreated();

  localStorage.setItem(
    CREATED_KEY,
    JSON.stringify([...created, movie])
  );

  return movie;
}

export function updateMockMovie(
  id: number,
  request: UpdateMovieRequest
): MovieDetail {
  const movie = getMockMovies().find(
    (item) => item.id === id
  );

  if (!movie) {
    throw {
      status: 404,
      message: 'Không tìm thấy phim.',
    };
  }

  const overrides = readOverrides();

  overrides[String(id)] = {
    ...request,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    OVERRIDES_KEY,
    JSON.stringify(overrides)
  );

  return {
    ...movie,
    ...overrides[String(id)],
  };
}

export function deleteMockMovie(
  id: number
): void {
  const exists = getMockMovies().some(
    (movie) => movie.id === id
  );

  if (!exists) {
    throw {
      status: 404,
      message: 'Không tìm thấy phim.',
    };
  }

  const deleted = new Set(readDeletions());

  deleted.add(id);

  localStorage.setItem(
    DELETIONS_KEY,
    JSON.stringify([...deleted])
  );
}

export function resetMockMovies(): void {
  localStorage.removeItem(OVERRIDES_KEY);
  localStorage.removeItem(DELETIONS_KEY);
  localStorage.removeItem(CREATED_KEY);
}