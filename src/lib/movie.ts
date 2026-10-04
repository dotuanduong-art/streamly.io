export function getReleaseYear(releaseDate?: string | null): string | null {
  if (!releaseDate || !/^\d{4}-\d{2}-\d{2}/.test(releaseDate)) return null;
  return releaseDate.slice(0, 4);
}
export function formatDuration(minutes?: number | null): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
  const value = Math.floor(minutes);
  if (!value) return null;
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return hours ? `${hours} giờ${remainder ? ` ${remainder} phút` : ''}` : `${remainder} phút`;
}
export function formatRating(value?: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return `${value.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 10`;
}
export function isValidMovieId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}
