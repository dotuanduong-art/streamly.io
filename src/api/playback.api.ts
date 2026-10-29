import { apiClient } from './client';
import type { PlaybackSource } from '@/types';
import { USE_MOCK } from '@/lib/constants';
import { mockPlaybackApi } from '@/mocks/playback/api';

export const playbackApi = {
  getMovieSources: async (
    movieId: number
  ): Promise<PlaybackSource[]> => {
    if (USE_MOCK) return mockPlaybackApi.getMovieSources();
    const response = await apiClient.get<PlaybackSource[]>(
      `/playback/movies/${movieId}/sources`
    );

    return response.data;
  },
};
