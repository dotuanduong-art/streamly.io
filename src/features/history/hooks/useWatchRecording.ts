import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRecordWatch } from './index';
import { USE_MOCK_AUTH } from '@/lib/constants';

export function useWatchRecording(movieId: number | null, active: boolean) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const recordedRef = useRef<number | null>(null);
  const record = useRecordWatch();

  useEffect(() => {
    if (!active) {
      recordedRef.current = null;
      return;
    }
    if (!USE_MOCK_AUTH || !isAuthenticated || movieId == null || recordedRef.current === movieId) return;
    recordedRef.current = movieId;
    void record.mutateAsync(movieId).catch(() => {
      // History logging never interrupts trailer playback.
    });
  }, [active, isAuthenticated, movieId, record.mutateAsync]);
}
