import type { HistoryItem } from '@/types';
import { USE_MOCK_USER_DATA } from '@/lib/constants';
import { mockHistoryApi } from '@/mocks/history/api';

function unavailable(): never {
  throw { status: 503, message: 'Lịch sử xem chưa khả dụng từ backend.' };
}

export const historyApi = {
  getHistory: (): Promise<HistoryItem[]> => USE_MOCK_USER_DATA ? mockHistoryApi.getHistory() : unavailable(),
  recordWatch: (movieId: number): Promise<void> => USE_MOCK_USER_DATA ? mockHistoryApi.recordWatch(movieId) : unavailable(),
  removeFromHistory: (movieId: number): Promise<void> => USE_MOCK_USER_DATA ? mockHistoryApi.removeFromHistory(movieId) : unavailable(),
  clearHistory: (): Promise<void> => USE_MOCK_USER_DATA ? mockHistoryApi.clearHistory() : unavailable(),
};
