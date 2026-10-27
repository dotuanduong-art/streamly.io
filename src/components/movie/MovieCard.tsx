import {
  Link,
} from 'react-router-dom';

import {
  Info,
  Play,
  Star,
} from 'lucide-react';

import type {
  MovieDetail,
} from '@/types';

import {
  SmartImage,
} from '@/components/ui/SmartImage';

import {
  formatDuration,
  formatRating,
  getReleaseYear,
} from '@/lib/movie';

import {
  MyListButton,
} from './MyListButton';

export interface MovieCardProps {
  movie: MovieDetail;
}

export function MovieCard({
  movie,
}: MovieCardProps) {
  const year =
    getReleaseYear(
      movie.releaseDate
    );

  const duration =
    formatDuration(
      movie.durationMinutes
    );

  // Danh sách phim ưu tiên poster dọc.
  // Backdrop chỉ là fallback khi phim không có poster.
  const image =
    movie.posterUrl ??
    movie.backdropUrl;

  return (
    <article className="movie-card group relative h-full rounded-card bg-background !transform-none">
      <Link
        data-testid={`movie-card-${movie.id}`}
        to={`/movie/${movie.id}`}
        aria-label={`Thông tin chi tiết về ${movie.title}`}
        className="block rounded-card"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-card bg-surface-card shadow-md transition-shadow duration-300 group-hover:shadow-xl">
          <SmartImage
            path={image}
            alt={movie.title}
            className="h-full w-full rounded-card object-cover transition-transform duration-300 group-hover:scale-[1.015]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-2xl">
              <Play
                size={23}
                fill="currentColor"
                className="ml-0.5"
              />
            </div>
          </div>
        </div>
      </Link>

      <div className="movie-card-panel rounded-b-card bg-surface-card px-3 pb-3 pt-2.5">
        <h3 className="mb-2 truncate text-sm font-bold text-text-primary">
          {movie.title}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <Link
            className="card-action bg-text-primary text-background"
            to={`/watch/${movie.id}`}
            aria-label={`Xem ${movie.title}`}
          >
            <Play
              size={17}
              fill="currentColor"
            />
          </Link>

          <MyListButton
            movie={movie}
            variant="icon"
          />

          <Link
            className="card-action ml-auto border border-text-secondary text-text-primary"
            to={`/movie/${movie.id}`}
            aria-label={`Thông tin chi tiết: ${movie.title}`}
          >
            <Info size={18} />
          </Link>
        </div>

        {(movie.voteAverage != null ||
          year ||
          duration) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-secondary">
            {movie.voteAverage != null && (
              <span className="flex items-center gap-1 text-status-success">
                <Star
                  size={12}
                  fill="currentColor"
                />

                {formatRating(
                  movie.voteAverage
                )}
              </span>
            )}

            {year && (
              <span>
                {year}
              </span>
            )}

            {duration && (
              <span>
                {duration}
              </span>
            )}
          </div>
        )}

        {!!movie.genres?.length && (
          <p className="mt-2 truncate text-caption text-text-secondary">
            {movie.genres
              .map(
                (genre) =>
                  genre.name
              )
              .join(' · ')}
          </p>
        )}
      </div>
    </article>
  );
}