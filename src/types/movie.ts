import { Genre } from './genre';

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl?: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  year: number;
  runtime: number; // Duration in minutes
  genres: Genre[];
  cast: CastMember[];
  rating: number; // e.g. 8.5
  posterPath: string | null; // URL to poster image
  backdropPath: string | null; // URL to backdrop image
  trailerKey: string | null; // YouTube embed key e.g. "dQw4w9WgXcQ"
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  releaseDate?: string;
  director?: string;
}

