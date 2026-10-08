import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('B1-UNIT-04 - LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth(null, null);
  });

  it('gọi login đúng 1 lần với email và password hợp lệ', async () => {
    const user = userEvent.setup();

    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'fake-login-token',
      user: {
        id: 2001,
        email: 'user@test.com',
        displayName: 'User Test',
        avatarUrl: null,
        role: 'User',
        createdAt: '2026-10-08T00:00:00Z',
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(
      screen.getByTestId('login-email'),
      'user@test.com'
    );

    await user.type(
      screen.getByTestId('login-password'),
      'Password123'
    );

    await user.click(
      screen.getByTestId('login-submit')
    );

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledTimes(1);
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'Password123',
    });
  });

  it('password rỗng thì không gọi login và hiển thị lỗi validation', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(
      screen.getByTestId('login-email'),
      'user@test.com'
    );

    await user.click(
      screen.getByTestId('login-submit')
    );

    await waitFor(() => {
      expect(authApi.login).not.toHaveBeenCalled();
    });

    expect(
      await screen.findByText(
        'Mật khẩu phải có ít nhất 8 ký tự.'
      )
    ).toBeInTheDocument();
  });
});