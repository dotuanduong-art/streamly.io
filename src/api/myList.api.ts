import type { Movie } from '@/types';
import { USE_MOCK_USER_DATA } from '@/lib/constants';
import { mockMyListApi } from '@/mocks/my-list/api';

function unavailable(): never {
  throw { status: 503, message: 'Danh sách của tôi chưa khả dụng từ backend.' };
}

export const myListApi = {
  getMyList: (): Promise<Movie[]> => USE_MOCK_USER_DATA ? mockMyListApi.getMyList() : unavailable(),
  addToMyList: (movieId: number): Promise<void> => USE_MOCK_USER_DATA ? mockMyListApi.addToMyList(movieId) : unavailable(),
  removeFromMyList: (movieId: number): Promise<void> => USE_MOCK_USER_DATA ? mockMyListApi.removeFromMyList(movieId) : unavailable(),
};
