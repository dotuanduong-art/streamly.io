import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  Film,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { Movie } from '@/types';
import { Button } from '@/components/ui/Button';
import { useImportTmdbMovie } from '@/features/admin/hooks';

export function AdminTmdbImportPage() {
  const navigate = useNavigate();
  const importMovie = useImportTmdbMovie();

  const [tmdbId, setTmdbId] = useState('');
  const [formError, setFormError] = useState('');
  const [importedMovie, setImportedMovie] =
    useState<Movie | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const parsedId = Number(tmdbId);

    if (
      !tmdbId.trim() ||
      !Number.isInteger(parsedId) ||
      parsedId <= 0
    ) {
      setFormError(
        'TMDB ID phải là số nguyên lớn hơn 0.'
      );
      return;
    }

    setFormError('');
    setImportedMovie(null);

    try {
      const movie =
        await importMovie.mutateAsync(parsedId);

      setImportedMovie(movie);
    } catch {
      // Hook đã hiển thị lỗi bằng toast.
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-3xl font-bold leading-snug text-text-primary">
            Import phim từ TMDB
          </h2>

          <p className="mt-2 max-w-2xl text-text-secondary">
            Nhập TMDB ID để Backend tự lấy thông tin
            phim, poster, backdrop, điểm đánh giá,
            thể loại và trailer từ TMDB.
          </p>
        </div>

        <div className="rounded-card border border-brand/30 bg-brand/10 px-5 py-3 text-brand">
          <div className="flex items-center gap-2 font-semibold">
            <Database size={18} />
            TMDB → Streamly
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Form import */}
        <section className="rounded-card border border-text-primary/10 bg-surface p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-brand/15 p-3 text-brand">
              <Download size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Import phim
              </h3>

              <p className="mt-1 text-sm text-text-muted">
                Chỉ cần nhập ID của phim trên TMDB.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="tmdb-import-id"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                TMDB ID
              </label>

              <input
                id="tmdb-import-id"
                data-testid="admin-tmdb-id"
                type="number"
                min="1"
                step="1"
                value={tmdbId}
                onChange={(event) =>
                  setTmdbId(event.target.value)
                }
                placeholder="Ví dụ: 550"
                disabled={importMovie.isPending}
                className="w-full rounded-button border border-text-primary/15 bg-background px-4 py-3 text-text-primary outline-none transition focus:border-brand"
              />

              <p className="mt-2 text-xs text-text-muted">
                Ví dụ: Fight Club có TMDB ID là 550.
              </p>
            </div>

            {formError && (
              <p
                role="alert"
                className="text-sm text-status-error"
              >
                {formError}
              </p>
            )}

            <Button
              data-testid="admin-tmdb-import"
              type="submit"
              isLoading={importMovie.isPending}
              leftIcon={<Download size={17} />}
            >
              Import từ TMDB
            </Button>
          </form>
        </section>

        {/* Hướng dẫn */}
        <aside className="rounded-card border border-text-primary/10 bg-surface p-5">
          <div className="flex items-center gap-2">
            <Info
              size={20}
              className="text-brand"
            />

            <h3 className="font-bold text-text-primary">
              Cách sử dụng
            </h3>
          </div>

          <ol className="mt-4 space-y-4 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">
                1
              </span>

              <span>
                Tìm phim trên TMDB và lấy ID của phim.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">
                2
              </span>

              <span>
                Nhập ID vào ô bên trái.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">
                3
              </span>

              <span>
                Bấm Import. Backend sẽ lấy dữ liệu
                TMDB và lưu vào Streamly.
              </span>
            </li>
          </ol>
        </aside>
      </div>

      {/* Kết quả import */}
      {importedMovie && (
        <section className="mt-6 rounded-card border border-status-success/30 bg-status-success/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={28}
                className="text-status-success"
              />

              <div>
                <p className="font-bold text-text-primary">
                  Import thành công
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {importedMovie.title}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              leftIcon={<Film size={16} />}
              onClick={() =>
                navigate(
                  `/admin/movies/${importedMovie.id}`
                )
              }
            >
              Mở phim vừa import
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminTmdbImportPage;