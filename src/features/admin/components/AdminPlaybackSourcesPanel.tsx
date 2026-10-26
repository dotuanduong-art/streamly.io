import {
  useState,
} from 'react';

import {
  CheckCircle2,
  Pencil,
  Play,
  Plus,
  Power,
  Star,
  Trash2,
} from 'lucide-react';

import type {
  CreatePlaybackSourceRequest,
  PlaybackSource,
  PlaybackSourceType,
  UpdatePlaybackSourceRequest,
} from '@/types';

import {
  Button,
} from '@/components/ui/Button';

import {
  ConfirmDialog,
} from '@/components/modal/ConfirmDialog';

import {
  useAdminPlaybackSources,
  useCreatePlaybackSource,
  useDeletePlaybackSource,
  useUpdatePlaybackSource,
} from '../hooks';

interface Props {
  movieId: number;
  movieTitle: string;
}

interface FormState {
  sourceUrl: string;
  sourceType: PlaybackSourceType;
  quality: string;
  language: string;
  providerName: string;
  license: string;
  attributionUrl: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  sourceUrl: '',
  sourceType: 'MP4',
  quality: '',
  language: '',
  providerName: '',
  license: '',
  attributionUrl: '',
  isActive: true,
  isDefault: false,
  sortOrder: '0',
};

function nullable(
  value: string
): string | null {
  const trimmed = value.trim();

  return trimmed
    ? trimmed
    : null;
}

function toRequest(
  form: FormState
): CreatePlaybackSourceRequest {
  return {
    sourceUrl:
      form.sourceUrl.trim(),

    sourceType:
      form.sourceType,

    quality:
      nullable(form.quality),

    language:
      nullable(form.language),

    providerName:
      nullable(
        form.providerName
      ),

    license:
      nullable(form.license),

    attributionUrl:
      nullable(
        form.attributionUrl
      ),

    isActive:
      form.isActive,

    isDefault:
      form.isDefault,

    sortOrder:
      Number(form.sortOrder) || 0,
  };
}

function sourceToRequest(
  source: PlaybackSource,
  patch: Partial<
    UpdatePlaybackSourceRequest
  > = {}
): UpdatePlaybackSourceRequest {
  return {
    sourceUrl:
      source.sourceUrl,

    sourceType:
      source.sourceType,

    quality:
      source.quality ?? null,

    language:
      source.language ?? null,

    providerName:
      source.providerName ?? null,

    license:
      source.license ?? null,

    attributionUrl:
      source.attributionUrl ?? null,

    isActive:
      source.isActive,

    isDefault:
      source.isDefault,

    sortOrder:
      source.sortOrder,

    ...patch,
  };
}

export function AdminPlaybackSourcesPanel({
  movieId,
  movieTitle,
}: Props) {
  const sourcesQuery =
    useAdminPlaybackSources(
      movieId
    );

  const createMutation =
    useCreatePlaybackSource(
      movieId
    );

  const updateMutation =
    useUpdatePlaybackSource(
      movieId
    );

  const deleteMutation =
    useDeletePlaybackSource(
      movieId
    );

  const [
    editingId,
    setEditingId,
  ] = useState<number | null>(
    null
  );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm
    );

  const [
    pendingDelete,
    setPendingDelete,
  ] =
    useState<PlaybackSource | null>(
      null
    );

  const sources =
    sourcesQuery.data ?? [];

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const beginEdit = (
    source: PlaybackSource
  ) => {
    setEditingId(source.id);

    setForm({
      sourceUrl:
        source.sourceUrl,

      sourceType:
        source.sourceType,

      quality:
        source.quality ?? '',

      language:
        source.language ?? '',

      providerName:
        source.providerName ?? '',

      license:
        source.license ?? '',

      attributionUrl:
        source.attributionUrl ?? '',

      isActive:
        source.isActive,

      isDefault:
        source.isDefault,

      sortOrder:
        String(
          source.sortOrder
        ),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const submit = async (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const request =
      toRequest(form);

    if (!request.sourceUrl) {
      return;
    }

    if (editingId) {
      await updateMutation
        .mutateAsync({
          id: editingId,
          request,
        });
    } else {
      await createMutation
        .mutateAsync(request);
    }

    resetForm();
  };

  const toggleActive = (
    source: PlaybackSource
  ) => {
    const nextActive =
      !source.isActive;

    updateMutation.mutate({
      id: source.id,

      request:
        sourceToRequest(
          source,
          {
            isActive:
              nextActive,

            isDefault:
              nextActive
                ? source.isDefault
                : false,
          }
        ),
    });
  };

  const makeDefault = (
    source: PlaybackSource
  ) => {
    updateMutation.mutate({
      id: source.id,

      request:
        sourceToRequest(
          source,
          {
            isActive: true,
            isDefault: true,
          }
        ),
    });
  };

  const confirmDelete =
    async () => {
      if (!pendingDelete) {
        return;
      }

      await deleteMutation
        .mutateAsync(
          pendingDelete.id
        );

      if (
        editingId ===
        pendingDelete.id
      ) {
        resetForm();
      }

      setPendingDelete(null);
    };

  const inputClass =
    'w-full rounded-button border border-text-primary/15 bg-background px-4 py-3 text-text-primary outline-none focus:border-brand';

  return (
    <section className="rounded-card border border-text-primary/10 bg-surface p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Play
              size={21}
              className="text-brand"
            />

            <h3 className="text-2xl font-bold">
              Nguồn phát
            </h3>
          </div>

          <p className="mt-2 text-sm text-text-secondary">
            Quản lý nguồn xem phim
            cho {movieTitle}.
          </p>
        </div>

        <div className="rounded-button bg-background px-3 py-2 text-sm text-text-secondary">
          {sources.length}
          {' '}
          nguồn
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-7 space-y-5 rounded-card border border-text-primary/10 bg-background p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold">
            {editingId
              ? 'Chỉnh sửa nguồn phát'
              : 'Thêm nguồn phát'}
          </h4>

          {editingId && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetForm}
            >
              Hủy chỉnh sửa
            </Button>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            URL nguồn phim *
          </label>

          <input
            type="url"
            required
            placeholder="https://.../movie.mp4"
            className={inputClass}
            value={form.sourceUrl}
            onChange={(event) =>
              setForm({
                ...form,
                sourceUrl:
                  event.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Loại nguồn
            </label>

            <select
              className={inputClass}
              value={
                form.sourceType
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  sourceType:
                    event.target
                      .value as PlaybackSourceType,
                })
              }
            >
              <option value="MP4">
                MP4
              </option>

              <option value="WEBM">
                WebM
              </option>

              <option value="HLS">
                HLS (.m3u8)
              </option>

              <option value="DASH">
                DASH
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Chất lượng
            </label>

            <input
              type="text"
              placeholder="1080p"
              className={inputClass}
              value={form.quality}
              onChange={(event) =>
                setForm({
                  ...form,
                  quality:
                    event.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Ngôn ngữ
            </label>

            <input
              type="text"
              placeholder="English"
              className={inputClass}
              value={form.language}
              onChange={(event) =>
                setForm({
                  ...form,
                  language:
                    event.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Nhà cung cấp
            </label>

            <input
              type="text"
              placeholder="Blender Studio"
              className={inputClass}
              value={
                form.providerName
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  providerName:
                    event.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Giấy phép
            </label>

            <input
              type="text"
              placeholder="CC BY 4.0"
              className={inputClass}
              value={form.license}
              onChange={(event) =>
                setForm({
                  ...form,
                  license:
                    event.target.value,
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Link thông tin nguồn /
            Attribution
          </label>

          <input
            type="url"
            className={inputClass}
            value={
              form.attributionUrl
            }
            onChange={(event) =>
              setForm({
                ...form,
                attributionUrl:
                  event.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Thứ tự
            </label>

            <input
              type="number"
              min="0"
              max="1000"
              className={inputClass}
              value={form.sortOrder}
              onChange={(event) =>
                setForm({
                  ...form,
                  sortOrder:
                    event.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 rounded-button border border-text-primary/10 px-4 py-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 accent-brand"
                checked={
                  form.isActive
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    isActive:
                      event.target
                        .checked,
                  })
                }
              />

              Hoạt động
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 accent-brand"
                checked={
                  form.isDefault
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    isDefault:
                      event.target
                        .checked,
                  })
                }
              />

              Nguồn mặc định
            </label>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isSaving}
          disabled={isSaving}
          leftIcon={
            editingId
              ? <Pencil size={17} />
              : <Plus size={17} />
          }
        >
          {editingId
            ? 'Lưu nguồn phát'
            : 'Thêm nguồn phát'}
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        {sourcesQuery.isLoading && (
          <p className="text-text-secondary">
            Đang tải nguồn phát...
          </p>
        )}

        {sourcesQuery.isError && (
          <div className="rounded-button border border-status-error/30 bg-status-error/10 p-4 text-status-error">
            Không thể tải danh sách
            nguồn phát.
          </div>
        )}

        {!sourcesQuery.isLoading &&
          !sources.length && (
            <div className="rounded-card border border-dashed border-text-primary/15 p-7 text-center text-text-secondary">
              Phim này chưa có nguồn
              phát.
            </div>
          )}

        {sources.map(
          (source) => (
            <article
              key={source.id}
              className="rounded-card border border-text-primary/10 bg-background p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {source.quality ||
                        source.sourceType}
                    </span>

                    <span className="rounded-full bg-surface-elevated px-2 py-1 text-xs">
                      {
                        source.sourceType
                      }
                    </span>

                    {source.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-1 text-xs text-brand">
                        <Star
                          size={12}
                          fill="currentColor"
                        />
                        Mặc định
                      </span>
                    )}

                    {source.isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-success/10 px-2 py-1 text-xs text-status-success">
                        <CheckCircle2
                          size={12}
                        />
                        Hoạt động
                      </span>
                    )}
                  </div>

                  <p className="mt-2 break-all text-sm text-text-secondary">
                    {source.sourceUrl}
                  </p>

                  <p className="mt-2 text-xs text-text-muted">
                    {[
                      source.providerName,
                      source.language,
                      source.license,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!source.isDefault && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={
                        updateMutation.isPending
                      }
                      onClick={() =>
                        makeDefault(
                          source
                        )
                      }
                    >
                      Đặt mặc định
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    leftIcon={
                      <Power size={15} />
                    }
                    disabled={
                      updateMutation.isPending
                    }
                    onClick={() =>
                      toggleActive(
                        source
                      )
                    }
                  >
                    {source.isActive
                      ? 'Tắt'
                      : 'Bật'}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    leftIcon={
                      <Pencil size={15} />
                    }
                    onClick={() =>
                      beginEdit(
                        source
                      )
                    }
                  >
                    Sửa
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    leftIcon={
                      <Trash2 size={15} />
                    }
                    onClick={() =>
                      setPendingDelete(
                        source
                      )
                    }
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </article>
          )
        )}
      </div>

      <ConfirmDialog
        isOpen={
          Boolean(
            pendingDelete
          )
        }
        onClose={() =>
          setPendingDelete(null)
        }
        onConfirm={() =>
          void confirmDelete()
        }
        title="Xóa nguồn phát"
        message={
          pendingDelete
            ? `Bạn có chắc muốn xóa nguồn ${pendingDelete.quality || pendingDelete.sourceType} của ${movieTitle}?`
            : ''
        }
        confirmLabel="Xóa nguồn"
        destructive
        isLoading={
          deleteMutation.isPending
        }
      />
    </section>
  );
}