import { useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AdminRoute } from './AdminRoute';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/api/client';
import { server } from '@/test/server';

function HomePageForTest() {
  return <div data-testid="home-page">Trang chủ</div>;
}

function AdminPageForTest() {
  useEffect(() => {
    void apiClient.get('/admin/movies');
  }, []);

  return <div data-testid="admin-page">Trang quản trị phim</div>;
}

describe('B1-INT-01 - Phân quyền Admin Route', () => {
  it('User thường không được vào /admin/movies và không gọi API Admin', async () => {
    let adminRequestCount = 0;

    server.use(
      http.get('*/api/admin/movies', () => {
        adminRequestCount += 1;

        return HttpResponse.json({
          items: [],
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        });
      })
    );

    useAuthStore.getState().setAuth(
      {
        id: 1001,
        email: 'user@test.com',
        displayName: 'User Test',
        avatarUrl: null,
        role: 'User',
        createdAt: '2026-10-08T00:00:00Z',
      },
      'fake-user-token'
    );

    render(
      <MemoryRouter initialEntries={['/admin/movies']}>
        <Routes>
          <Route
            path="/"
            element={<HomePageForTest />}
          />

          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminPageForTest />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByTestId('home-page')
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId('admin-page')
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(adminRequestCount).toBe(0);
    });
  });
});