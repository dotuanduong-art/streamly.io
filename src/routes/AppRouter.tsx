import { MainLayout } from '@/components/layout/MainLayout';
import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MovieDetailPage from '@/pages/MovieDetailPage';
import SearchPage from '@/pages/SearchPage';
import GenrePage from '@/pages/GenrePage';
import WatchPage from '@/pages/WatchPage';
import MyListPage from '@/pages/MyListPage';
import HistoryPage from '@/pages/HistoryPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const AdminMoviesPage = lazy(() => import('@/pages/admin/AdminMoviesPage'));
const AdminMovieEditPage = lazy(() => import('@/pages/admin/AdminMovieEditPage'));
const AdminGenresPage = lazy(() => import('@/pages/admin/AdminGenresPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { GuestRoute } from './GuestRoute';

export const AppRouter: React.FC = () => {
  const adminFallback = <div role="status" className="min-h-screen animate-pulse bg-background p-8"><div className="h-10 w-56 rounded-card bg-surface-elevated" /><div className="mt-8 h-96 rounded-card bg-surface" /></div>;
  return (
    <Routes>
      <Route element={<MainLayout />}>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/movie/:id" element={<MovieDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/genre/:id" element={<GenrePage />} />
      <Route path="/watch/:id" element={<WatchPage />} />

      {/* Protected User Routes */}
      <Route
        path="/my-list"
        element={
          <ProtectedRoute>
            <MyListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      </Route>
      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute><Suspense fallback={adminFallback}><AdminLayout /></Suspense></AdminRoute>}>
        {/* Dashboard comes later; Movies is the current admin landing page. */}
        <Route index element={<Navigate to="movies" replace />} />
        <Route path="movies" element={<Suspense fallback={adminFallback}><AdminMoviesPage /></Suspense>} />
        <Route path="movies/new" element={<Suspense fallback={adminFallback}><AdminMovieEditPage /></Suspense>} />
        <Route path="movies/:id" element={<Suspense fallback={adminFallback}><AdminMovieEditPage /></Suspense>} />
        <Route path="genres" element={<Suspense fallback={adminFallback}><AdminGenresPage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={adminFallback}><AdminUsersPage /></Suspense>} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};


