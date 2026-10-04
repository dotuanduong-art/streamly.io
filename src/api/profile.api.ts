import type { UpdateProfileRequest, User } from '@/types';
import { USE_MOCK_USER_DATA } from '@/lib/constants';
import { mockProfileApi } from '@/mocks/profile/api';

function unavailable(): never {
  throw { status: 503, message: 'Profile editing is not available from the backend yet.' };
}

export const profileApi = {
  updateProfile: (request: UpdateProfileRequest): Promise<User> => USE_MOCK_USER_DATA ? mockProfileApi.updateProfile(request) : unavailable(),
};
