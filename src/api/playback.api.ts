import { apiClient } from './client';
import type { PlaybackSource } from '@/types';

export const playbackApi = {
  getMovieSources: async (
    movieId: number
  ): Promise<PlaybackSource[]> => {
    const response = await apiClient.get<PlaybackSource[]>(
      `/playback/movies/${movieId}/sources`
    );

    return response.data;
  },
};