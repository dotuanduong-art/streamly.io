import type { HistoryItem } from '@/types';
import { USE_MOCK_USER_DATA } from '@/lib/constants';
import { mockHistoryApi } from '@/mocks/history/api';
import { apiClient } from './client';

export const historyApi = {
  getHistory: async (): Promise<HistoryItem[]> => {
    if (USE_MOCK_USER_DATA) {
      return mockHistoryApi.getHistory();
    }

    const { data } = await apiClient.get<HistoryItem[]>(
      '/history'
    );

    return data;
  },

  recordWatch: async (
    movieId: number
  ): Promise<void> => {
    if (USE_MOCK_USER_DATA) {
      return mockHistoryApi.recordWatch(movieId);
    }

    await apiClient.post(`/history/${movieId}`);
  },

  removeFromHistory: async (
    movieId: number
  ): Promise<void> => {
    if (USE_MOCK_USER_DATA) {
      return mockHistoryApi.removeFromHistory(movieId);
    }

    await apiClient.delete(`/history/${movieId}`);
  },

  clearHistory: async (): Promise<void> => {
    if (USE_MOCK_USER_DATA) {
      return mockHistoryApi.clearHistory();
    }

    await apiClient.delete('/history');
  },
};