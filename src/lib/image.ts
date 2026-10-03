export function getImageUrl(url?: string | null, _size?: string): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

