import type { PlaybackSource } from '@/types';

// Mock mode has trailers, never fabricated full-movie playback sources.
export const mockPlaybackApi = {
  getMovieSources: async (): Promise<PlaybackSource[]> => [],
};
