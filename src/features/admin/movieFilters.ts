import type { Movie } from '@/types';
import { normalizeText } from '@/lib/text';

export type VisibilityFilter = 'all' | 'visible' | 'hidden';
export type FeaturedFilter = 'all' | 'featured';
export type TrailerFilter = 'all' | 'with' | 'without';
export interface AdminMovieFilters { search: string; visibility: VisibilityFilter; featured: FeaturedFilter; trailer: TrailerFilter }

export function filterAdminMovies(movies: Movie[], filters: AdminMovieFilters): Movie[] {
  const query = normalizeText(filters.search.trim());
  return movies.filter((movie) => {
    if (query && !normalizeText(movie.title).includes(query)) return false;
    if (filters.visibility === 'visible' && !movie.isVisible) return false;
    if (filters.visibility === 'hidden' && movie.isVisible) return false;
    if (filters.featured === 'featured' && !movie.isFeatured) return false;
    const hasTrailer = Boolean(movie.trailerKey?.trim());
    if (filters.trailer === 'with' && !hasTrailer) return false;
    if (filters.trailer === 'without' && hasTrailer) return false;
    return true;
  });
}
