import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { UpdateProfileRequest } from '@/types';
import { profileApi } from '@/api/profile.api';
import { useAuthStore } from '@/store/useAuthStore';

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: (request: UpdateProfileRequest) => profileApi.updateProfile(request),
    onSuccess: (user) => {
      updateUser(user);
      toast.success('Profile updated.');
    },
  });
}
