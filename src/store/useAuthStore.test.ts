import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from './useAuthStore';

describe('B1-UNIT-05 - authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('setAuth lưu user, token và trạng thái đăng nhập', () => {
    const testUser = {
      id: 3001,
      email: 'admin@test.com',
      displayName: 'Admin Test',
      avatarUrl: null,
      role: 'Admin' as const,
      createdAt: '2026-10-08T00:00:00Z',
    };

    useAuthStore.getState().setAuth(
      testUser,
      'abc'
    );

    const state = useAuthStore.getState();

    expect(state.user).toEqual(testUser);
    expect(state.accessToken).toBe('abc');
    expect(state.isAuthenticated).toBe(true);

    expect(
      localStorage.getItem(
        'streamly_access_token'
      )
    ).toBe('abc');
  });

  it('logout xóa user, token và trạng thái đăng nhập', () => {
    const testUser = {
      id: 3002,
      email: 'user@test.com',
      displayName: 'User Test',
      avatarUrl: null,
      role: 'User' as const,
      createdAt: '2026-10-08T00:00:00Z',
    };

    useAuthStore.getState().setAuth(
      testUser,
      'logout-test-token'
    );

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);

    expect(
      localStorage.getItem(
        'streamly_access_token'
      )
    ).toBeNull();
  });
});