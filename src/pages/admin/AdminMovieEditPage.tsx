import React from 'react';
import { useParams } from 'react-router-dom';
import { isValidMovieId } from '@/lib/movie';

export const AdminMovieEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';
  const movieId = isNew ? null : Number(id);
  if (!isNew && (movieId === null || !isValidMovieId(movieId))) {
    return <section><h2 className="text-2xl font-bold text-text-primary">Movie not found</h2></section>;
  }

  return (
    <section className="rounded-card border border-text-primary/10 bg-surface p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {isNew ? 'Admin - Add New Movie' : `Admin - Edit Movie #${movieId}`}
      </h2>
      <p className="text-text-secondary">The movie form is coming in Phase 6.</p>
    </section>
  );
};

export default AdminMovieEditPage;
