/**
 * Centralized Logger for Production
 * Wraps console methods and only logs in development mode.
 */

export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[APP]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    // In production, you might want to send this to a service like Sentry
    console.error('[ERROR]', ...args);
  },
  perf: (label: string, duration: number) => {
    if (__DEV__) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  },
};
