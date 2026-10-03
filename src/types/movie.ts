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
  genres?: Genre[];
  isTrending?: boolean;
  isNew?: boolean;
  rating?: number | null;
}

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

