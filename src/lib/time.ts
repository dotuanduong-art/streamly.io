export function formatRelativeTime(value?: string | null, now = Date.now()): string | null {
  if (!value) return null;
  const watched = Date.parse(value);
  if (!Number.isFinite(watched)) return null;
  const seconds = Math.max(0, Math.floor((now - watched) / 1000));
  if (seconds < 60) return 'vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(watched);
}
