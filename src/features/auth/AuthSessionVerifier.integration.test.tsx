import { useLayoutEffect } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/constants', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/constants')>(
      '@/lib/constants'
    );

  return {
    ...actual,
    USE_MOCK_AUTH: false,
  };
});

import { AuthSessionVerifier } from './components/AuthSessionVerifier';
import { useAuthStore } from '@/store/useAuthStore';
import { server } from '@/test/server';
import { registerAppNavigate } from '@/lib/navigation';

function NavigationRegistrar() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    registerAppNavigate(navigate);

    return () => {
      registerAppNavigate(null);
    };
  }, [navigate]);

  return null;
}

describe('B1-INT-02 - Token hết hạn / API trả 401', () => {
  afterEach(() => {
    registerAppNavigate(null);
    useAuthStore.getState().logout();
  });

  it('xóa phiên đăng nhập, chuyển về Login và không gọi /auth/me lặp vô hạn', async () => {
    let meRequestCount = 0;
    let authorizationHeader: string | null = null;

    server.use(
      http.get('*/api/auth/me', ({ request }) => {
        meRequestCount += 1;
        authorizationHeader =
          request.headers.get('authorization');

        return HttpResponse.json(
          {
            message: 'Phiên đăng nhập đã hết hạn.',
          },
          {
            status: 401,
          }
        );
      })
    );

    useAuthStore.getState().setAuth(
      {
        id: 1002,
        email: 'expired@test.com',
        displayName: 'Expired User',
        avatarUrl: null,
        role: 'User',
        createdAt: '2026-10-08T00:00:00Z',
      },
      'expired-token'
    );

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <NavigationRegistrar />

        <AuthSessionVerifier />

        <Routes>
          <Route
            path="/profile"
            element={
              <div data-testid="profile-page">
                Trang hồ sơ
              </div>
            }
          />

          <Route
            path="/login"
            element={
              <div data-testid="login-page">
                Trang đăng nhập
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByTestId('login-page')
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(meRequestCount).toBe(1);
    });

    expect(authorizationHeader).toBe(
      'Bearer expired-token'
    );

    expect(
      useAuthStore.getState().user
    ).toBeNull();

    expect(
      useAuthStore.getState().accessToken
    ).toBeNull();

    expect(
      useAuthStore.getState().isAuthenticated
    ).toBe(false);

    expect(
      localStorage.getItem('streamly_access_token')
    ).toBeNull();
  });
});