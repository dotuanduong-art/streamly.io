import type { PaginationResponse } from '@/types';
export function paginate<T>(items: T[], page = 1, pageSize = 20): PaginationResponse<T> {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safeSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 20;
  return {
    items: items.slice((safePage - 1) * safeSize, safePage * safeSize),
    page: safePage, pageSize: safeSize, totalItems: items.length,
    totalPages: Math.ceil(items.length / safeSize),
  };
}
