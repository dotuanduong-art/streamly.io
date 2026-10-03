import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes dynamically
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format movie duration in minutes to "Xh Ym"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format TMDB YouTube embed URL
 */
export function getYouTubeEmbedUrl(trailerKey?: string): string | null {
  if (!trailerKey) return null;
  return `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`;
}
