import { z } from 'zod';

const optionalNumber = (
  min: number,
  max?: number
) =>
  z.string().refine(
    (value) => {
      if (!value.trim()) {
        return true;
      }

      const number = Number(value);

      if (Number.isNaN(number)) {
        return false;
      }

      if (number < min) {
        return false;
      }

      if (
        max !== undefined &&
        number > max
      ) {
        return false;
      }

      return true;
    },
    {
      message:
        max !== undefined
          ? `Giá trị phải từ ${min} đến ${max}.`
          : `Giá trị phải từ ${min} trở lên.`,
    }
  );

export const adminMovieSchema =
  z.object({
    tmdbId: z
      .string()
      .trim()
      .min(
        1,
        'TMDB ID là bắt buộc.'
      )
      .refine(
        (value) =>
          Number.isInteger(
            Number(value)
          ) &&
          Number(value) > 0,
        'TMDB ID phải là số nguyên dương.'
      ),

    title: z
      .string()
      .trim()
      .min(
        1,
        'Tên phim là bắt buộc.'
      )
      .max(
        255,
        'Tên phim không được vượt quá 255 ký tự.'
      ),

    overview: z.string(),

    releaseDate: z.string(),

    durationMinutes:
      optionalNumber(
        1,
        1000
      ),

    posterUrl: z.string(),

    backdropUrl: z.string(),

    trailerKey: z
      .string()
      .max(
        100,
        'Trailer Key không được vượt quá 100 ký tự.'
      ),

    voteAverage:
      optionalNumber(0, 10),

    popularity:
      optionalNumber(0),

    isVisible: z.boolean(),

    isFeatured: z.boolean(),
  });

export type AdminMovieFormValues =
  z.infer<
    typeof adminMovieSchema
  >;