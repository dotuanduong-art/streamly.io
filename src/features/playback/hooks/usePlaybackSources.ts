import { useQuery } from '@tanstack/react-query';
import { playbackApi } from '@/api/playback.api';
import { queryKeys } from '@/lib/queryKeys';
import { isValidMovieId } from '@/lib/movie';

export function usePlaybackSources(movieId: number) {
  return useQuery({
    queryKey: queryKeys.playback(movieId),
    queryFn: () => playbackApi.getMovieSources(movieId),
    enabled: isValidMovieId(movieId),
    networkMode: 'always',
  });
}