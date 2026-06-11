'use client';

const ACCESS_TOKEN_KEY = 'taskflow_access_token';
const REFRESH_IN_PROGRESS_KEY = 'taskflow_refresh_in_progress';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_IN_PROGRESS_KEY);
}

export function clearRefreshFlag() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REFRESH_IN_PROGRESS_KEY);
}

export function markRefreshInProgress() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REFRESH_IN_PROGRESS_KEY, '1');
}

export function isRefreshInProgress() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(REFRESH_IN_PROGRESS_KEY) === '1';
}

export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    clearTokens();
    window.location.href = '/login';
  }
}
