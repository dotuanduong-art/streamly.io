import { useMemo, useState } from 'react';
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import type { Genre } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';

import {
  useAdminGenres,
  useCreateGenre,
  useDeleteGenre,
  useUpdateGenre,
} from '@/features/admin/hooks';

export function AdminGenresPage() {
  const genresQuery = useAdminGenres();
  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deleteGenre = useDeleteGenre();

  const [search, setSearch] = useState('');
  const [editingGenre, setEditingGenre] =
    useState<Genre | null>(null);

  const [name, setName] = useState('');
  const [tmdbId, setTmdbId] = useState('');

  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] =
    useState<Genre | null>(null);

  const genres = genresQuery.data ?? [];

  const filteredGenres = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return [...genres].sort((a, b) =>
        a.name.localeCompare(b.name, 'vi')
      );
    }

    return genres
      .filter((genre) => {
        const nameMatches =
          genre.name
            .toLowerCase()
            .includes(keyword);

        const tmdbMatches =
          String(genre.tmdbId ?? '').includes(
            keyword
          );

        return nameMatches || tmdbMatches;
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'vi')
      );
  }, [genres, search]);

  const resetForm = () => {
    setEditingGenre(null);
    setName('');
    setTmdbId('');
    setFormError('');
  };

  const startEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setName(genre.name);
    setTmdbId(
      genre.tmdbId != null
        ? String(genre.tmdbId)
        : ''
    );
    setFormError('');
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedTmdbId = Number(tmdbId);

    if (!trimmedName) {
      setFormError(
        'Vui lòng nhập tên thể loại.'
      );
      return;
    }

    if (
      !tmdbId.trim() ||
      !Number.isInteger(parsedTmdbId) ||
      parsedTmdbId <= 0
    ) {
      setFormError(
        'TMDB ID phải là số nguyên lớn hơn 0.'
      );
      return;
    }

    setFormError('');

    try {
      if (editingGenre) {
        await updateGenre.mutateAsync({
          id: editingGenre.id,
          name: trimmedName,
          tmdbId: parsedTmdbId,
        });
      } else {
        await createGenre.mutateAsync({
          name: trimmedName,
          tmdbId: parsedTmdbId,
        });
      }

      resetForm();
    } catch {
      // Hook đã hiển thị lỗi bằng toast.
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await deleteGenre.mutateAsync(
        pendingDelete.id
      );

      if (
        editingGenre?.id ===
        pendingDelete.id
      ) {
        resetForm();
      }

      setPendingDelete(null);
    } catch {
      // Hook đã hiển thị lỗi bằng toast.
    }
  };

  const isSaving =
    createGenre.isPending ||
    updateGenre.isPending;

  return (
    <div>
      {/* Tiêu đề */}
      <section className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/20              via-surface to-surface p-6 shadow-xl shadow-black/10 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Nội dung Streamly
            </div>

            <h2 className="text-3xl font-black leading-snug text-text-primary sm:text-4xl">
              Quản lý thể loại
            </h2>

            <p className="mt-2 max-w-2xl text-text-secondary">
              Tổ chức danh mục phim, cập nhật TMDB ID và
              quản lý các thể loại đang sử dụng trên Streamly.
            </p>
          </div>

          <div className="min-w-[150px] rounded-2xl border border-brand/30 bg-background/60 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
              Tổng thể loại
            </p>

            <p className="mt-2 text-4xl font-black text-brand">
              {genres.length}
            </p>
          </div>
        </div>
      </section>

      {/* Form thêm / sửa */}
      <section className="mt-6 rounded-2xl border border-brand/15 bg-gradient-to-br from-surface to-surface-elevated/50 p-5 shadow-lg shadow-black/5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-text-primary">
              {editingGenre
                ? 'Chỉnh sửa thể loại'
                : 'Thêm thể loại mới'}
            </h3>

            {editingGenre && (
              <p className="mt-1 text-sm text-text-muted">
                Đang sửa ID hệ thống:{' '}
                {editingGenre.id}
              </p>
            )}
          </div>

          {editingGenre && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<X size={16} />}
              onClick={resetForm}
            >
              Hủy chỉnh sửa
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
        >
          <div>
            <label
              htmlFor="genre-name"
              className="mb-2 block text-sm font-semibold text-text-primary"
            >
              Tên thể loại
            </label>

            <input
              id="genre-name"
              data-testid="admin-genre-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ví dụ: Hành động"
              disabled={isSaving}
              className="w-full rounded-button border border-text-primary/15 bg-background px-4 py-2.5 text-text-primary outline-none transition focus:border-brand"
            />
          </div>

          <div>
            <label
              htmlFor="genre-tmdb-id"
              className="mb-2 block text-sm font-semibold text-text-primary"
            >
              TMDB ID
            </label>

            <input
              id="genre-tmdb-id"
              data-testid="admin-genre-tmdb-id"
              type="number"
              min="1"
              step="1"
              value={tmdbId}
              onChange={(event) =>
                setTmdbId(event.target.value)
              }
              placeholder="Ví dụ: 28"
              disabled={isSaving}
              className="w-full rounded-button border border-text-primary/15 bg-background px-4 py-2.5 text-text-primary outline-none transition focus:border-brand"
            />
          </div>

          <div className="flex items-end">
            <Button
              data-testid="admin-genre-submit"
              type="submit"
              isLoading={isSaving}
              leftIcon={
                editingGenre ? (
                  <Pencil size={17} />
                ) : (
                  <Plus size={17} />
                )
              }
              className="w-full md:w-auto"
            >
              {editingGenre
                ? 'Lưu thay đổi'
                : 'Thêm thể loại'}
            </Button>
          </div>
        </form>

        {formError && (
          <p
            role="alert"
            className="mt-3 text-sm text-status-error"
          >
            {formError}
          </p>
        )}
      </section>

      {/* Tìm kiếm */}
      <div className="my-6 rounded-2xl border border-text-primary/10 bg-surface/80 p-4 shadow-md shadow-black/5 backdrop-blur">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />

          <input
            data-testid="admin-genre-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Tìm theo tên thể loại hoặc TMDB ID"
            className="w-full rounded-xl border border-text-primary/15 bg-background/80 py-3 pl-10 pr-4 text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Danh sách */}
      {genresQuery.isLoading ? (
        <div className="rounded-card border border-text-primary/10 bg-surface p-8 text-center text-text-secondary">
          Đang tải danh sách thể loại...
        </div>
      ) : genresQuery.error ? (
        <div className="rounded-card border border-status-error/30 bg-surface p-8 text-center">
          <p className="text-status-error">
            Không thể tải danh sách thể loại.
          </p>

          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() =>
              void genresQuery.refetch()
            }
          >
            Thử lại
          </Button>
        </div>
      ) : filteredGenres.length === 0 ? (
        <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center text-text-secondary">
          {genres.length === 0
            ? 'Chưa có thể loại nào.'
            : 'Không tìm thấy thể loại phù hợp.'}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto rounded-2xl border border-text-primary/10 bg-surface shadow-xl shadow-black/10 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-brand/10 text-text-primary">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    ID
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    TMDB ID
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Tên thể loại
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredGenres.map(
                  (genre) => (
                    <tr
                      key={genre.id}
                      data-testid={`admin-genre-row-${genre.id}`}
                      className="border-t border-text-primary/10 bg-surface transition duration-200 hover:bg-brand/5"
                    >
                      <td className="px-5 py-4 text-text-secondary">
                        {genre.id}
                      </td>

                      <td className="px-5 py-4 text-text-secondary">
                        {genre.tmdbId ?? '—'}
                      </td>

                      <td className="px-5 py-4 font-semibold text-text-primary">
                        {genre.name}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            data-testid={`admin-genre-edit-${genre.id}`}
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={
                              <Pencil
                                size={15}
                              />
                            }
                            onClick={() =>
                              startEdit(genre)
                            }
                          >
                            Sửa
                          </Button>

                          <Button
                            data-testid={`admin-genre-delete-${genre.id}`}
                            type="button"
                            variant="danger"
                            size="sm"
                            leftIcon={
                              <Trash2
                                size={15}
                              />
                            }
                            disabled={
                              deleteGenre.isPending
                            }
                            onClick={() =>
                              setPendingDelete(
                                genre
                              )
                            }
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="grid gap-3 md:hidden">
            {filteredGenres.map((genre) => (
              <article
                key={genre.id}
                data-testid={`admin-genre-row-mobile-${genre.id}`}
                className="rounded-card border border-text-primary/10 bg-surface p-4"
              >
                <div>
                  <h3 className="font-bold text-text-primary">
                    {genre.name}
                  </h3>

                  <p className="mt-1 text-sm text-text-muted">
                    ID: {genre.id} · TMDB:{' '}
                    {genre.tmdbId ?? '—'}
                  </p>
                </div>

                <div className="mt-4 flex gap-2 border-t border-text-primary/10 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={
                      <Pencil size={15} />
                    }
                    onClick={() =>
                      startEdit(genre)
                    }
                  >
                    Sửa
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    leftIcon={
                      <Trash2 size={15} />
                    }
                    disabled={
                      deleteGenre.isPending
                    }
                    onClick={() =>
                      setPendingDelete(genre)
                    }
                  >
                    Xóa
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() =>
          setPendingDelete(null)
        }
        onConfirm={() =>
          void confirmDelete()
        }
        title="Xóa thể loại"
        message={`Bạn có chắc muốn xóa thể loại “${pendingDelete?.name ?? ''}”? Nếu thể loại đang được gán cho phim thì hệ thống sẽ không cho phép xóa.`}
        confirmLabel="Xóa thể loại"
        destructive
        isLoading={deleteGenre.isPending}
      />
    </div>
  );
}

export default AdminGenresPage;