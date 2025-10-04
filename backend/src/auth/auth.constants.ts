// Authentication related constants (cookie names, lifetimes, etc.)
export const REFRESH_COOKIE_NAME = 'rt';
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const REFRESH_COOKIE_SAMESITE: 'lax' = 'lax';
export function isSecureEnv() {
  return process.env.NODE_ENV === 'production';
}
