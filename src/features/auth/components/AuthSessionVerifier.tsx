import { useEffect } from 'react';
import { authApi } from '@/api/auth.api';
import { USE_MOCK_AUTH } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';

const verificationInFlight = new Set<string>();

export function AuthSessionVerifier() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    if (USE_MOCK_AUTH || !accessToken || verificationInFlight.has(accessToken)) return;
    verificationInFlight.add(accessToken);
    void authApi.getCurrentUser()
      .then((user) => updateUser(user))
      .catch(() => {
        // The response interceptor handles 401; network errors preserve the hydrated session.
      })
      .finally(() => verificationInFlight.delete(accessToken));
  }, [accessToken, updateUser]);

  return null;
}
