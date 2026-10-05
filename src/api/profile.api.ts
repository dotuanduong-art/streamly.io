import type {
  UpdateProfileRequest,
  User,
} from '@/types';

import { USE_MOCK_USER_DATA } from '@/lib/constants';
import { mockProfileApi } from '@/mocks/profile/api';
import { apiClient } from './client';

export const profileApi = {
  updateProfile: async (
    request: UpdateProfileRequest
  ): Promise<User> => {
    if (USE_MOCK_USER_DATA) {
      return mockProfileApi.updateProfile(request);
    }

    const { data } = await apiClient.put<User>(
      '/profile',
      request
    );

    return data;
  },

  uploadAvatar: async (
    file: File
  ): Promise<User> => {
    if (USE_MOCK_USER_DATA) {
      throw new Error(
        'Upload ảnh đại diện không khả dụng ở chế độ mock.'
      );
    }

    const formData = new FormData();

    formData.append('file', file);

    const { data } = await apiClient.post<User>(
      '/profile/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  },
};