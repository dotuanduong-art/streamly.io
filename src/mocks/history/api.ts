import type { HistoryItem } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { moviesApi } from '@/api/movies.api';

const STORAGE_KEY = 'streamly_mock_history';
type HistoryRecord = { movieId: number; watchedAt: string };

function currentUserId(): number {
  const user = useAuthStore.getState().user;
  if (!user) throw { status: 401, message: 'Vui lòng đăng nhập để xem lịch sử.' };
  return user.id;
}
function delay(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 300 + Math.floor(Math.random() * 301)));
}
function readHistory(): Record<string, HistoryRecord[]> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const result: Record<string, HistoryRecord[]> = {};
    for (const [key, records] of Object.entries(value)) {
      if (Array.isArray(records)) result[key] = records.filter((record): record is HistoryRecord =>
        typeof record === 'object' && record !== null && typeof record.movieId === 'number'
        && typeof record.watchedAt === 'string' && Number.isFinite(Date.parse(record.watchedAt)));
    }
    return result;
  } catch {
    return {};
  }
}
function writeHistory(history: Record<string, HistoryRecord[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export const mockHistoryApi = {
  getHistory: async (): Promise<HistoryItem[]> => {
    const key = String(currentUserId());
    await delay();
    const visibleMovies = (await moviesApi.getMovies()).filter((movie) => movie.isVisible !== false);
    const byId = new Map(visibleMovies.map((movie) => [movie.id, movie]));
    const all = readHistory();
    const saved = all[key] ?? [];
    const valid = saved.filter((record) => byId.has(record.movieId));
    if (valid.length !== saved.length) {
      all[key] = valid;
      writeHistory(all);
    }
    return valid.map((record) => ({ movie: byId.get(record.movieId)!, watchedAt: record.watchedAt }))
      .sort((a, b) => b.watchedAt.localeCompare(a.watchedAt));
  },
  recordWatch: async (movieId: number): Promise<void> => {
    const key = String(currentUserId());
    await delay();
    const movie = (await moviesApi.getMovies()).find((item) => item.id === movieId && item.isVisible !== false);
    if (!movie) throw { status: 404, message: 'Không tìm thấy phim.' };
    const all = readHistory();
    all[key] = [{ movieId, watchedAt: new Date().toISOString() }, ...(all[key] ?? []).filter((item) => item.movieId !== movieId)];
    writeHistory(all);
  },
  removeFromHistory: async (movieId: number): Promise<void> => {
    const key = String(currentUserId());
    await delay();
    const all = readHistory();
    all[key] = (all[key] ?? []).filter((item) => item.movieId !== movieId);
    writeHistory(all);
  },
  clearHistory: async (): Promise<void> => {
    const key = String(currentUserId());
    await delay();
    const all = readHistory();
    all[key] = [];
    writeHistory(all);
  },
};
