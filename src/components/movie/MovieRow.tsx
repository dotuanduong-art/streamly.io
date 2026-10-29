import {
  useId,
} from 'react';

import type {
  MovieDetail,
} from '@/types';

import {
  getErrorMessage,
} from '@/lib/error';

import {
  Carousel,
} from '@/components/carousel/Carousel';

import {
  MovieCard,
} from './MovieCard';

import {
  Skeleton,
} from '@/components/feedback/Skeleton';

import {
  ErrorState,
} from '@/components/feedback/ErrorState';
import { Reveal } from '@/components/ui/Reveal';
import { motionTiming } from '@/lib/motion';

export interface MovieRowProps {
  title: string;
  testIdSlug?: string;
  movies?: MovieDetail[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function MovieRow({
  title,
  testIdSlug,
  movies = [],
  isLoading,
  error,
  onRetry,
}: MovieRowProps) {
  const id = useId();

  const slug =
    testIdSlug ??
    title
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /(^-|-$)/g,
        ''
      );

  const normalizedTitle =
    title.toLocaleLowerCase(
      'vi-VN'
    );

  // Tự nhận diện riêng hàng Trending.
  const isTrending =
    normalizedTitle.includes(
      'thịnh hành'
    );

  if (
    !isLoading &&
    !error &&
    !movies.length
  ) {
    return null;
  }

  return (
    <section
      data-testid={`movie-row-${slug}`}
      aria-labelledby={id}
      className="movie-row relative mb-10 md:mb-12"
    >
      <Reveal><h2
        id={id}
        className="mb-5 text-section font-semibold tracking-tight"
      >
        {title}
      </h2></Reveal>

      {error ? (
        <ErrorState
          title={`Không thể tải ${title.toLocaleLowerCase(
            'vi-VN'
          )}`}
          message={
            getErrorMessage(
              error
            )
          }
          onRetry={onRetry}
        />
      ) : (
        <Carousel
          label={title}
        >
          {isLoading
            ? Array.from(
                {
                  length: 7,
                },
                (_, index) => (
                  <div
                    key={index}
                    role="status"
                    aria-label="Đang tải phim"
                    className={
                      isTrending
                        ? 'w-[170px] flex-none pl-8 sm:w-[185px] sm:pl-9 md:w-[200px] md:pl-10 lg:w-[215px]'
                        : 'w-[140px] flex-none sm:w-[155px] md:w-[175px] lg:w-[195px] xl:w-[210px]'
                    }
                  >
                    <Skeleton className="aspect-[2/3] w-full rounded-card" />
                    <Skeleton className="mt-2 h-5 w-3/4" />
                  </div>
                )
              )
            : movies.map(
                (
                  movie,
                  index
                ) => (
                  <div
                    key={
                      movie.id
                    }
                    className={
                      isTrending
                        ? 'relative w-[170px] flex-none pl-8 sm:w-[185px] sm:pl-9 md:w-[200px] md:pl-10 lg:w-[215px]'
                        : 'w-[140px] flex-none sm:w-[155px] md:w-[175px] lg:w-[195px] xl:w-[210px]'
                    }
                  >
                    {isTrending && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[-4px] left-0 z-20 select-none font-black leading-none tracking-tighter text-black"
                        style={{
                          fontSize:
                            'clamp(72px, 7vw, 112px)',
                          WebkitTextStroke:
                            '2px rgba(255, 255, 255, 0.78)',
                        }}
                      >
                        {index +
                          1}
                      </span>
                    )}

                    <Reveal delay={Math.min(index, 5) * motionTiming.stagger}><MovieCard
                      movie={
                        movie
                      }
                    /></Reveal>
                  </div>
                )
              )}
        </Carousel>
      )}
    </section>
  );
}
