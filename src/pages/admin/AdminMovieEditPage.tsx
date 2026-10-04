import {
  useParams,
} from 'react-router-dom';

import {
  AdminMovieForm,
} from '@/features/admin/components/AdminMovieForm';

import {
  useAdminMovies,
} from '@/features/admin/hooks';

import {
  isValidMovieId,
} from '@/lib/movie';

export function AdminMovieEditPage() {
  const { id } =
    useParams<{
      id?: string;
    }>();

  const isNew =
    !id ||
    id === 'new';

  const movieId =
    isNew
      ? null
      : Number(id);

  const moviesQuery =
    useAdminMovies();

  if (
    !isNew &&
    (
      movieId === null ||
      !isValidMovieId(
        movieId
      )
    )
  ) {
    return (
      <section className="rounded-card border border-text-primary/10 bg-surface p-8">
        <h2 className="text-2xl font-bold text-text-primary">
          Không tìm thấy phim
        </h2>
      </section>
    );
  }

  if (
    !isNew &&
    moviesQuery.isLoading
  ) {
    return (
      <section className="rounded-card border border-text-primary/10 bg-surface p-8">
        Đang tải phim...
      </section>
    );
  }

  if (
    !isNew &&
    moviesQuery.error
  ) {
    return (
      <section className="rounded-card border border-status-error/30 bg-surface p-8">
        <h2 className="text-2xl font-bold text-text-primary">
          Không thể tải phim
        </h2>

        <p className="mt-2 text-text-secondary">
          Vui lòng quay lại
          danh sách phim và
          thử lại.
        </p>
      </section>
    );
  }

  const movie =
    isNew
      ? undefined
      : moviesQuery.data
          ?.find(
            (item) =>
              item.id ===
              movieId
          );

  if (
    !isNew &&
    !movie
  ) {
    return (
      <section className="rounded-card border border-text-primary/10 bg-surface p-8">
        <h2 className="text-2xl font-bold text-text-primary">
          Không tìm thấy phim
        </h2>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-text-primary/10 bg-surface p-5 sm:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary">
          {isNew
            ? 'Thêm phim mới'
            : 'Chỉnh sửa phim'}
        </h2>

        <p className="mt-2 text-text-secondary">
          {isNew
            ? 'Thêm phim vào danh mục Streamly.'
            : `Đang chỉnh sửa: ${
                movie?.title ??
                ''
              }`}
        </p>
      </div>

      <AdminMovieForm
        movie={movie}
      />
    </section>
  );
}

export default AdminMovieEditPage;