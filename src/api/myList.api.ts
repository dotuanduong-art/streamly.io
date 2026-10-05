import type { Movie } from '@/types';
import { USE_MOCK_USER_DATA } from '@/lib/constants';
import { mockMyListApi } from '@/mocks/my-list/api';
import { apiClient } from './client';

export const myListApi = {
  getMyList: async (): Promise<Movie[]> => {
    if (USE_MOCK_USER_DATA) {
      return mockMyListApi.getMyList();
    }

    const { data } = await apiClient.get<Movie[]>('/my-list');
    return data;
  },

  addToMyList: async (movieId: number): Promise<void> => {
    if (USE_MOCK_USER_DATA) {
      return mockMyListApi.addToMyList(movieId);
    }

    await apiClient.post(`/my-list/${movieId}`);
  },

  removeFromMyList: async (movieId: number): Promise<void> => {
    if (USE_MOCK_USER_DATA) {
      return mockMyListApi.removeFromMyList(movieId);
    }

    await apiClient.delete(`/my-list/${movieId}`);
  },
};