import { useEffect } from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { StreamlyPlayer } from '@/components/movie/StreamlyPlayer';
import { TrailerPlayer } from '@/components/movie/TrailerPlayer';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/feedback/Skeleton';

import { useMovie } from '@/features/movies/hooks';
import { usePlaybackSources } from '@/features/playback/hooks/usePlaybackSources';
import { useWatchRecording } from '@/features/history/hooks/useWatchRecording';

import { isValidMovieId } from '@/lib/movie';
import { normalizeApiError } from '@/lib/error';

export default function WatchPage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const movieId = Number(id);

  const validId =
    isValidMovieId(movieId);

  const movie =
    useMovie(movieId);

  const playback =
    usePlaybackSources(movieId);

  const notFound =
    !validId ||
    (
      movie.isError &&
      normalizeApiError(
        movie.error
      ).status === 404
    );

  const hasPlayableSource =
    Boolean(
      playback.data?.some(
        (source) => source.isActive
      )
    );

  useWatchRecording(
    movie.data?.id ?? null,
    hasPlayableSource || Boolean(movie.data?.trailerKey)
  );

  useEffect(() => {
    document.title = movie.data
      ? `${movie.data.title} — Xem phim | Streamly`
      : 'Xem phim | Streamly';
  }, [movie.data]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-button px-2 py-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={20} />

          Quay lại
        </button>

        {notFound ? (
          <div className="py-24 text-center">
            <h1 className="text-4xl font-bold leading-snug">
              Không tìm thấy phim
            </h1>

            <p className="mt-4 text-text-secondary">
              {movie.error
                ? normalizeApiError(
                    movie.error
                  ).message
                : 'Không tìm thấy phim.'}
            </p>

            <Link
              to="/"
              className="mt-7 inline-block text-brand hover:underline"
            >
              Về trang chủ
            </Link>
          </div>
        ) : movie.isLoading ||
          playback.isLoading ? (
          <div className="mt-6">
            <Skeleton className="aspect-video w-full rounded-card" />

            <Skeleton className="mt-5 h-9 w-1/2" />
          </div>
        ) : movie.isError ? (
          <ErrorState
            title="Không thể tải phim"
            error={movie.error}
            onRetry={() =>
              void movie.refetch()
            }
          />
        ) : playback.isError ? (
          <ErrorState
            title="Không thể tải nguồn phát"
            error={playback.error}
            onRetry={() =>
              void playback.refetch()
            }
          />
        ) : movie.data ? (
          <div className="mt-5">
            {hasPlayableSource ? (
              <StreamlyPlayer
                sources={
                  playback.data ?? []
                }
                title={movie.data.title}
                autoPlay
              />
            ) : movie.data.trailerKey ? (
              <TrailerPlayer trailerKey={movie.data.trailerKey} title={movie.data.title} autoPlay />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-card bg-surface-elevated p-8 text-center">
                <div>
                  <p className="text-lg font-semibold text-text-primary">
                    Phim này chưa có nguồn phát
                  </p>

                  <p className="mt-2 text-sm text-text-secondary">
                    Nguồn phim đang được cập nhật.
                  </p>

                  <Link
                    className="mt-4 inline-block text-brand hover:underline"
                    to={`/movie/${movie.data.id}`}
                  >
                    Quay lại thông tin phim
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
              <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
                {movie.data.title}
              </h1>

              {hasPlayableSource && (
                <span className="text-sm text-text-secondary">
                  Đang phát trên Streamly
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
