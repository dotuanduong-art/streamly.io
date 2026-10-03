import { MainLayout } from '@/components/layout/MainLayout';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminMoviesPage from '@/pages/admin/AdminMoviesPage';
import AdminMovieEditPage from '@/pages/admin/AdminMovieEditPage';
import AdminGenresPage from '@/pages/admin/AdminGenresPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/movies"
        element={
          <AdminRoute>
            <AdminMoviesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/movies/new"
        element={
          <AdminRoute>
            <AdminMovieEditPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/movies/:id"
        element={
          <AdminRoute>
            <AdminMovieEditPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/genres"
        element={
          <AdminRoute>
            <AdminGenresPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};


