import { env } from '../env.js';

/**
 * Centralized Backend Logger
 */
export const logger = {
  log: (...args: any[]) => {
    if (env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      console.log(`[API]`, ...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(`[API WARN]`, ...args);
  },
  error: (...args: any[]) => {
    // In production, send to Error Tracking (Sentry, ELK, etc)
    console.error(`[API ERROR]`, ...args);
  },
  info: (...args: any[]) => {
    console.info(`[API INFO]`, ...args);
  },
  debug: (...args: any[]) => {
    if (env.NODE_ENV === 'development') {
      console.debug(`[API DEBUG]`, ...args);
    }
  }
};
