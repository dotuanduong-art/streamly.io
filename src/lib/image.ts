export function getImageUrl(path: string | null, size = 'w780'): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
