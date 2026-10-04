import { MainLayout } from '@/components/layout/MainLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import React, { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';

// Pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const MovieDetailPage = lazy(() => import('@/pages/MovieDetailPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const GenrePage = lazy(() => import('@/pages/GenrePage'));
const WatchPage = lazy(() => import('@/pages/WatchPage'));
const MyListPage = lazy(() => import('@/pages/MyListPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminMoviesPage = lazy(() => import('@/pages/admin/AdminMoviesPage'));
const AdminMovieEditPage = lazy(() => import('@/pages/admin/AdminMovieEditPage'));
const AdminGenresPage = lazy(() => import('@/pages/admin/AdminGenresPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { GuestRoute } from './GuestRoute';

function RoutePageFallback() {
  return <div role="status" aria-label="Loading page" className="page-gutter min-h-[60svh] animate-pulse py-12"><div className="h-10 w-52 rounded-card bg-surface-elevated" /><div className="mt-8 h-72 rounded-card bg-surface" /></div>;
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RoutePageFallback />}>{children}</Suspense>;
}

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
      {/* Public Routes */}
      <Route path="/" element={<LazyRoute><HomePage /></LazyRoute>} />
      <Route path="/login" element={<GuestRoute><LazyRoute><LoginPage /></LazyRoute></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><LazyRoute><RegisterPage /></LazyRoute></GuestRoute>} />
      <Route path="/movie/:id" element={<LazyRoute><MovieDetailPage /></LazyRoute>} />
      <Route path="/search" element={<LazyRoute><SearchPage /></LazyRoute>} />
      <Route path="/genre/:id" element={<LazyRoute><GenrePage /></LazyRoute>} />
      <Route path="/watch/:id" element={<LazyRoute><WatchPage /></LazyRoute>} />

      {/* Protected User Routes */}
      <Route
        path="/my-list"
        element={
          <ProtectedRoute>
            <LazyRoute><MyListPage /></LazyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <LazyRoute><HistoryPage /></LazyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <LazyRoute><ProfilePage /></LazyRoute>
          </ProtectedRoute>
        }
      />

      </Route>
      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        {/* Dashboard comes later; Movies is the current admin landing page. */}
        <Route index element={<Navigate to="movies" replace />} />
        <Route path="movies" element={<LazyRoute><AdminMoviesPage /></LazyRoute>} />
        <Route path="movies/new" element={<LazyRoute><AdminMovieEditPage /></LazyRoute>} />
        <Route path="movies/:id" element={<LazyRoute><AdminMovieEditPage /></LazyRoute>} />
        <Route path="genres" element={<LazyRoute><AdminGenresPage /></LazyRoute>} />
        <Route path="users" element={<LazyRoute><AdminUsersPage /></LazyRoute>} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<LazyRoute><NotFoundPage /></LazyRoute>} />
    </Routes>
  );
};


