import type { Movie } from '@/types';
import { moviesApi } from './movies.api';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';

const STORAGE_KEY = 'streamly_mock_my_lists';

function delay(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 250));
}

function currentUserId(): number {
  const user = useAuthStore.getState().user;
  if (!user) throw { status: 401, message: 'Sign in to use My List.' };
  return user.id;
}

function assertAvailable(): void {
  if (!USE_MOCK_AUTH) throw { status: 503, message: 'My List is not available from the backend yet.' };
}

function readLists(): Record<string, number[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const result: Record<string, number[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) result[key] = value.filter((id): id is number => typeof id === 'number' && id > 0);
    }
    return result;
  } catch {
    return {};
  }
}

function writeLists(lists: Record<string, number[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export const myListApi = {
  getMyList: async (): Promise<Movie[]> => {
    assertAvailable();
    const userId = currentUserId();
    await delay();
    const movies = (await moviesApi.getMovies()).filter((movie) => movie.isVisible !== false);
    const lists = readLists();
    const ids = lists[String(userId)] ?? [];
    const validMovies = ids.map((id) => movies.find((movie) => movie.id === id)).filter((movie): movie is Movie => Boolean(movie));
    const validIds = validMovies.map((movie) => movie.id);
    if (validIds.length !== ids.length) {
      lists[String(userId)] = validIds;
      writeLists(lists);
    }
    return validMovies;
  },

  addToMyList: async (movieId: number): Promise<void> => {
    assertAvailable();
    const userId = currentUserId();
    await delay();
    const movie = (await moviesApi.getMovies()).find((item) => item.id === movieId && item.isVisible !== false);
    if (!movie) throw { status: 404, message: 'Movie not found.' };
    const lists = readLists();
    const key = String(userId);
    lists[key] = Array.from(new Set([...(lists[key] ?? []), movieId]));
    writeLists(lists);
  },

  removeFromMyList: async (movieId: number): Promise<void> => {
    assertAvailable();
    const userId = currentUserId();
    await delay();
    const lists = readLists();
    const key = String(userId);
    lists[key] = (lists[key] ?? []).filter((id) => id !== movieId);
    writeLists(lists);
  },
};
