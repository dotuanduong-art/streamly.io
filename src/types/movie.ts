import type { Genre } from './genre';

export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string | null;
  releaseDate?: string | null;
  durationMinutes?: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerKey?: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  voteAverage?: number | null;
  popularity?: number | null;
  viewCount?: number | null;
  genres?: Genre[];
}

export type UpdateMovieRequest = Pick<Movie,
  | 'title'
  | 'overview'
  | 'releaseDate'
  | 'durationMinutes'
  | 'posterUrl'
  | 'backdropUrl'
  | 'trailerKey'
  | 'isVisible'
  | 'isFeatured'
  | 'voteAverage'
  | 'popularity'
>;

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl?: string;
}

// Mock-only extras until the backend adds them to its contract.
export type MovieDetail = Movie & {
  cast?: CastMember[];
};

