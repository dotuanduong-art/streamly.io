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
  if (status === 403) message = 'You do not have permission to access this content.';
  if (isAxios && !error.response) {
    message = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? 'The request timed out. Please try again.'
      : 'Unable to connect. Check your connection and try again. If this continues, the server may be unavailable or blocking this connection.';
  }
  return { status, message: message ?? 'Something went wrong. Please try again.', ...(Object.keys(errors).length ? { errors } : {}) };
}
export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
