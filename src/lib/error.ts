import axios from 'axios';
import type { ApiError } from '@/types';

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}
function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}
export function normalizeApiError(error: unknown): ApiError {
  const isAxios = axios.isAxiosError<unknown>(error);
  const body = record(isAxios ? error.response?.data : error);
  const status = isAxios ? error.response?.status : typeof body.status === 'number' ? body.status : undefined;
  const rawErrors = record(body.errors);
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(rawErrors)) {
    if (Array.isArray(value) && value.every((item): item is string => typeof item === 'string')) errors[key] = value;
  }
  let message = text(body.message) ?? text(body.detail) ?? text(body.title);
  if (status === 403) message = 'Bạn không có quyền truy cập';
  if (isAxios && !error.response) {
    message = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.'
      : 'Không thể kết nối. Hãy kiểm tra đường truyền và thử lại.';
  }
  return { status, message: message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.', ...(Object.keys(errors).length ? { errors } : {}) };
}
export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
