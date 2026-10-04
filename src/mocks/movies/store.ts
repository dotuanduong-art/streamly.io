import type { MovieDetail, UpdateMovieRequest } from '@/types';
import { mockMovies } from './data';

const OVERRIDES_KEY = 'streamly_mock_movies_overrides';
const DELETIONS_KEY = 'streamly_mock_movies_deletions';
type MovieOverride = Partial<UpdateMovieRequest> & { updatedAt: string };

function readOverrides(): Record<string, MovieOverride> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(OVERRIDES_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, MovieOverride> : {};
  } catch {
    return {};
  }
}

function readDeletions(): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DELETIONS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function getMockMovies(): MovieDetail[] {
  const overrides = readOverrides();
  const deleted = new Set(readDeletions());
  return mockMovies.filter((movie) => !deleted.has(movie.id)).map((movie) => ({ ...movie, ...overrides[String(movie.id)] }));
}

export function updateMockMovie(id: number, request: UpdateMovieRequest): MovieDetail {
  const movie = getMockMovies().find((item) => item.id === id);
  if (!movie) throw { status: 404, message: 'Movie not found.' };
  const overrides = readOverrides();
  overrides[String(id)] = { ...request, updatedAt: new Date().toISOString() };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  return { ...movie, ...overrides[String(id)] };
}

export function deleteMockMovie(id: number): void {
  if (!getMockMovies().some((movie) => movie.id === id)) throw { status: 404, message: 'Movie not found.' };
  const deleted = new Set(readDeletions());
  deleted.add(id);
  localStorage.setItem(DELETIONS_KEY, JSON.stringify([...deleted]));
}

export function resetMockMovies(): void {
  localStorage.removeItem(OVERRIDES_KEY);
  localStorage.removeItem(DELETIONS_KEY);
}
