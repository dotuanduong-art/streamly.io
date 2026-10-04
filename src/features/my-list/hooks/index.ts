import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { MovieDetail } from '@/types';
import { myListApi } from '@/api/myList.api';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage, normalizeApiError } from '@/lib/error';
import { useAuthStore } from '@/store/useAuthStore';
import { features } from '@/lib/features';

export function useMyList() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.myList(user?.id ?? 0),
    queryFn: myListApi.getMyList,
    enabled: features.myListAvailable && isAuthenticated && Boolean(user),
    networkMode: 'always',
  });
}

export function useIsInMyList(movieId: number) {
  const list = useMyList();
  return { ...list, isInMyList: list.data?.some((movie) => movie.id === movieId) ?? false };
}

export function useToggleMyList(movie: MovieDetail) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const list = useIsInMyList(movie.id);
  const key = queryKeys.myList(user?.id ?? 0);
  const mutation = useMutation({
    mutationFn: async (shouldAdd: boolean) => {
      if (!features.myListAvailable) return;
      if (shouldAdd) await myListApi.addToMyList(movie.id);
      else await myListApi.removeFromMyList(movie.id);
    },
    onMutate: async (shouldAdd) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MovieDetail[]>(key);
      queryClient.setQueryData<MovieDetail[]>(key, (current = []) => shouldAdd
        ? current.some((item) => item.id === movie.id) ? current : [...current, movie]
        : current.filter((item) => item.id !== movie.id));
      return { previous };
    },
    onError: (error, shouldAdd, context) => {
      const status = normalizeApiError(error).status;
      if ((shouldAdd && status === 409) || (!shouldAdd && status === 404)) return;
      queryClient.setQueryData(key, context?.previous);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_data, shouldAdd) => toast.success(shouldAdd ? 'Added to My List.' : 'Removed from My List.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  return {
    isInMyList: list.isInMyList,
    isLoading: list.isLoading,
    isPending: mutation.isPending,
    toggle: () => {
      if (features.myListAvailable) mutation.mutate(!list.isInMyList);
    },
  };
}
