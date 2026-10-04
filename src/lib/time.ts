export function formatRelativeTime(value?: string | null, now = Date.now()): string | null {
  if (!value) return null;
  const watched = Date.parse(value);
  if (!Number.isFinite(watched)) return null;
  const seconds = Math.max(0, Math.floor((now - watched) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return new Date(watched).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
