export function getImageUrl(url?: string | null): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}
