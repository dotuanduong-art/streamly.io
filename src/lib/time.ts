function parseBackendDate(
  value?: string | null
): number | null {
  if (!value) return null;

  const trimmed = value.trim();

  // Nếu Backend đã trả kèm múi giờ:
  // 2026-10-05T15:00:00Z
  // hoặc 2026-10-05T15:00:00+00:00
  // thì giữ nguyên.
  const hasTimezone =
    /Z$/i.test(trimmed) ||
    /[+-]\d{2}:\d{2}$/.test(trimmed);

  // Nếu không có timezone, coi thời gian Backend là UTC.
  const normalized = hasTimezone
    ? trimmed
    : `${trimmed}Z`;

  const timestamp = Date.parse(normalized);

  return Number.isFinite(timestamp)
    ? timestamp
    : null;
}

export function formatRelativeTime(
  value?: string | null,
  now = Date.now()
): string | null {
  const watched = parseBackendDate(value);

  if (watched === null) return null;

  const seconds = Math.max(
    0,
    Math.floor((now - watched) / 1000)
  );

  if (seconds < 60) {
    return 'vừa xong';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} phút trước`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Hôm qua';
  }

  if (days < 30) {
    return `${days} ngày trước`;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(watched));
}

export function formatDate(
  value?: string | null
): string | null {
  const timestamp = parseBackendDate(value);

  if (timestamp === null) return null;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));
}