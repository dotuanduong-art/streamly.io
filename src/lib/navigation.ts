import type { NavigateFunction } from 'react-router-dom';

let appNavigate: NavigateFunction | null = null;

export function registerAppNavigate(navigate: NavigateFunction | null): void {
  appNavigate = navigate;
}

export function navigateFromApi(to: string, options?: { replace?: boolean; state?: unknown }): void {
  if (appNavigate) appNavigate(to, options);
  else window.location.assign(to);
}
