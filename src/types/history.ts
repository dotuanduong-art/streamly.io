import type { Movie } from './movie';

export interface HistoryItem {
  movie: Movie;
  watchedAt: string;
}
