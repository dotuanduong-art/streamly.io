import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes dynamically
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format TMDB YouTube embed URL
 */
export function getYouTubeEmbedUrl(trailerKey?: string | null): string | null {
  if (!trailerKey) return null;
  return `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`;
}

