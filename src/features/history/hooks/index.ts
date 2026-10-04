import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { HistoryItem } from '@/types';
import { historyApi } from '@/api/history.api';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/error';
import { useAuthStore } from '@/store/useAuthStore';
import { features } from '@/lib/features';

export function useHistory() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.history(user?.id ?? 0),
    queryFn: historyApi.getHistory,
    enabled: features.historyAvailable && isAuthenticated && Boolean(user),
    networkMode: 'always',
  });
}

export function useRecordWatch() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const key = queryKeys.history(user?.id ?? 0);
  return useMutation({
    mutationFn: historyApi.recordWatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useRemoveFromHistory() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const key = queryKeys.history(user?.id ?? 0);
  return useMutation({
    mutationFn: historyApi.removeFromHistory,
    onMutate: async (movieId: number) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HistoryItem[]>(key);
      queryClient.setQueryData<HistoryItem[]>(key, (current = []) => current.filter((item) => item.movie.id !== movieId));
      return { previous };
    },
    onError: (error, _movieId, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useClearHistory() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const key = queryKeys.history(user?.id ?? 0);
  return useMutation({
    mutationFn: historyApi.clearHistory,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HistoryItem[]>(key);
      queryClient.setQueryData<HistoryItem[]>(key, []);
      return { previous };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.error(getErrorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
