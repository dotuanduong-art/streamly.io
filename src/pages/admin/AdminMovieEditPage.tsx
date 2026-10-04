import React from 'react';
import { useParams } from 'react-router-dom';
import { isValidMovieId } from '@/lib/movie';

export const AdminMovieEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';
  const movieId = isNew ? null : Number(id);
  if (!isNew && (movieId === null || !isValidMovieId(movieId))) {
    return <section><h2 className="text-2xl font-bold leading-snug text-text-primary">Không tìm thấy phim</h2></section>;
  }

  return (
    <section className="rounded-card border border-text-primary/10 bg-surface p-8">
      <h2 className="mb-2 text-2xl font-bold leading-snug text-text-primary">
        {isNew ? 'Quản trị - Thêm phim' : `Quản trị - Sửa phim #${movieId}`}
      </h2>
      <p className="text-text-secondary">Biểu mẫu phim sẽ có trong giai đoạn tiếp theo.</p>
    </section>
  );
};

export default AdminMovieEditPage;
