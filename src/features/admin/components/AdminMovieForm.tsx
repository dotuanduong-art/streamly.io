import {
  useEffect,
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useQueryClient,
} from '@tanstack/react-query';

import toast from 'react-hot-toast';

import type {
  CreateMovieRequest,
  Movie,
  UpdateMovieRequest,
} from '@/types';

import {
  Button,
} from '@/components/ui/Button';

import {
  SmartImage,
} from '@/components/ui/SmartImage';

import {
  adminApi,
} from '@/api/admin.api';

import {
  normalizeApiError,
} from '@/lib/error';

import {
  queryKeys,
} from '@/lib/queryKeys';

import {
  adminMovieSchema,
  type AdminMovieFormValues,
} from '../movieSchema';

interface AdminMovieFormProps {
  movie?: Movie;
}

const emptyValues:
  AdminMovieFormValues = {
    tmdbId: '',
    title: '',
    overview: '',
    releaseDate: '',
    durationMinutes: '',
    posterUrl: '',
    backdropUrl: '',
    trailerKey: '',
    voteAverage: '',
    popularity: '',
    isVisible: true,
    isFeatured: false,
  };

function nullableText(
  value: string
): string | null {
  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}

function nullableNumber(
  value: string
): number | null {
  const trimmed =
    value.trim();

  return trimmed
    ? Number(trimmed)
    : null;
}

export function AdminMovieForm({
  movie,
}: AdminMovieFormProps) {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const [
    formError,
    setFormError,
  ] = useState('');

  const isEdit =
    Boolean(movie);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<AdminMovieFormValues>(
      {
        resolver:
          zodResolver(
            adminMovieSchema
          ),

        defaultValues:
          emptyValues,
      }
    );

  useEffect(() => {
    if (!movie) {
      reset(emptyValues);
      return;
    }

    reset({
      tmdbId:
        String(movie.tmdbId),

      title:
        movie.title,

      overview:
        movie.overview ?? '',

      releaseDate:
        movie.releaseDate
          ?.slice(0, 10) ??
        '',

      durationMinutes:
        movie.durationMinutes !=
        null
          ? String(
              movie.durationMinutes
            )
          : '',

      posterUrl:
        movie.posterUrl ?? '',

      backdropUrl:
        movie.backdropUrl ?? '',

      trailerKey:
        movie.trailerKey ?? '',

      voteAverage:
        movie.voteAverage != null
          ? String(
              movie.voteAverage
            )
          : '',

      popularity:
        movie.popularity != null
          ? String(
              movie.popularity
            )
          : '',

      isVisible:
        movie.isVisible,

      isFeatured:
        movie.isFeatured,
    });
  }, [
    movie,
    reset,
  ]);

  const posterUrl =
    watch('posterUrl');

  const backdropUrl =
    watch('backdropUrl');

  const title =
    watch('title') ||
    'Xem trước phim';

  const submit =
    handleSubmit(
      async (values) => {
        setFormError('');

        const common = {
          title:
            values.title.trim(),

          overview:
            nullableText(
              values.overview
            ),

          releaseDate:
            values.releaseDate
              ? `${values.releaseDate}T00:00:00`
              : null,

          durationMinutes:
            nullableNumber(
              values.durationMinutes
            ),

          posterUrl:
            nullableText(
              values.posterUrl
            ),

          backdropUrl:
            nullableText(
              values.backdropUrl
            ),

          trailerKey:
            nullableText(
              values.trailerKey
            ),

          voteAverage:
            nullableNumber(
              values.voteAverage
            ),

          popularity:
            nullableNumber(
              values.popularity
            ),

          isVisible:
            values.isVisible,

          isFeatured:
            values.isFeatured,
        };

        try {
          if (movie) {
            const request:
              UpdateMovieRequest =
                common;

            await adminApi
              .updateMovie(
                movie.id,
                request
              );

            toast.success(
              'Đã cập nhật phim.'
            );
          } else {
            const request:
              CreateMovieRequest =
                {
                  tmdbId:
                    Number(
                      values.tmdbId
                    ),

                  ...common,
                };

            await adminApi
              .createMovie(
                request
              );

            toast.success(
              'Đã thêm phim.'
            );
          }

          await Promise.all([
            queryClient
              .invalidateQueries({
                queryKey:
                  queryKeys
                    .adminMovies,
              }),

            queryClient
              .invalidateQueries({
                queryKey:
                  queryKeys
                    .movies.all,
              }),
          ]);

          navigate(
            '/admin/movies'
          );
        } catch (error) {
          setFormError(
            normalizeApiError(
              error
            ).message
          );
        }
      }
    );

  const inputClass =
    'w-full rounded-button border border-text-primary/15 bg-background px-4 py-3 text-text-primary outline-none focus:border-brand';

  const errorClass =
    'mt-1 text-sm text-status-error';

  return (
    <form
      data-testid="admin-movie-form"
      onSubmit={submit}
      noValidate
      className="space-y-7"
    >
      {formError && (
        <div
          data-testid="admin-movie-form-error"
          role="alert"
          className="rounded-button border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            TMDB ID *
          </label>

          <input
            data-testid="admin-movie-tmdb"
            type="number"
            min="1"
            readOnly={
              isEdit
            }
            className={`${inputClass} ${
              isEdit
                ? 'cursor-not-allowed opacity-60'
                : ''
            }`}
            {...register(
              'tmdbId'
            )}
          />

          {errors.tmdbId && (
            <p
              className={
                errorClass
              }
            >
              {
                errors
                  .tmdbId
                  .message
              }
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Tên phim *
          </label>

          <input
            data-testid="admin-movie-title"
            type="text"
            className={
              inputClass
            }
            {...register(
              'title'
            )}
          />

          {errors.title && (
            <p
              className={
                errorClass
              }
            >
              {
                errors
                  .title
                  .message
              }
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Mô tả
        </label>

        <textarea
          data-testid="admin-movie-overview"
          rows={5}
          className={
            inputClass
          }
          {...register(
            'overview'
          )}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Ngày phát hành
          </label>

          <input
            data-testid="admin-movie-release-date"
            type="date"
            className={
              inputClass
            }
            {...register(
              'releaseDate'
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Thời lượng (phút)
          </label>

          <input
            data-testid="admin-movie-duration"
            type="number"
            min="1"
            max="1000"
            className={
              inputClass
            }
            {...register(
              'durationMinutes'
            )}
          />

          {errors
            .durationMinutes && (
            <p
              className={
                errorClass
              }
            >
              {
                errors
                  .durationMinutes
                  .message
              }
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Trailer Key
          </label>

          <input
            data-testid="admin-movie-trailer"
            type="text"
            placeholder="Ví dụ: zSWdZVtXT7E"
            className={
              inputClass
            }
            {...register(
              'trailerKey'
            )}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Poster URL
          </label>

          <input
            data-testid="admin-movie-poster"
            type="text"
            className={
              inputClass
            }
            {...register(
              'posterUrl'
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Backdrop /
            Banner URL
          </label>

          <input
            data-testid="admin-movie-backdrop"
            type="text"
            className={
              inputClass
            }
            {...register(
              'backdropUrl'
            )}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Điểm TMDB
            (0–10)
          </label>

          <input
            data-testid="admin-movie-rating"
            type="number"
            min="0"
            max="10"
            step="0.1"
            className={
              inputClass
            }
            {...register(
              'voteAverage'
            )}
          />

          {errors
            .voteAverage && (
            <p
              className={
                errorClass
              }
            >
              {
                errors
                  .voteAverage
                  .message
              }
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Popularity
          </label>

          <input
            data-testid="admin-movie-popularity"
            type="number"
            min="0"
            step="0.1"
            className={
              inputClass
            }
            {...register(
              'popularity'
            )}
          />

          {errors
            .popularity && (
            <p
              className={
                errorClass
              }
            >
              {
                errors
                  .popularity
                  .message
              }
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 rounded-card border border-text-primary/10 bg-background p-4">
        <label className="flex items-center gap-3">
          <input
            data-testid="admin-movie-visible"
            type="checkbox"
            className="h-5 w-5 accent-brand"
            {...register(
              'isVisible'
            )}
          />

          <span>
            Hiển thị
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            data-testid="admin-movie-featured"
            type="checkbox"
            className="h-5 w-5 accent-brand"
            {...register(
              'isFeatured'
            )}
          />

          <span>
            Nổi bật /
            Hero Banner
          </span>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold">
            Xem trước poster
          </p>

          <SmartImage
            path={posterUrl}
            alt={title}
            className="aspect-[2/3] w-full rounded-card"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">
            Xem trước backdrop
            / banner
          </p>

          <SmartImage
            path={backdropUrl}
            alt={title}
            className="aspect-video w-full rounded-card"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          data-testid="admin-movie-save"
          type="submit"
          isLoading={
            isSubmitting
          }
          disabled={
            isSubmitting
          }
        >
          {isEdit
            ? 'Lưu thay đổi'
            : 'Thêm phim'}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={
            isSubmitting
          }
          onClick={() =>
            navigate(
              '/admin/movies'
            )
          }
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}