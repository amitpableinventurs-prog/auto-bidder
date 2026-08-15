import { Alert, BackHandler, Platform } from 'react-native';
import { API_BASE_URL, STRIPE_PUBLISHABLE_KEY } from '../config';
import { logger } from './logger';

const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

export const validateEnv = (): boolean => {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  );

  // In production, we MUST have these variables defined properly
  if (!__DEV__) {
     const isApiValid = API_BASE_URL && (API_BASE_URL.startsWith('https://') || !API_BASE_URL.includes('autobidder.in'));
     const isStripeValid = STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.length > 0;

     if (STRIPE_PUBLISHABLE_KEY.includes('dummy')) {
        logger.warn('WARNING: Using dummy Stripe key in non-dev build.');
     }

     if (!isApiValid || !isStripeValid || missing.length > 0) {
        logger.error('PRODUCTION CONFIG ERROR:');
        logger.error('Missing Vars:', missing);
        logger.error('API_BASE_URL:', API_BASE_URL);

        // Returning false instead of exiting. The root App will handle this.
        return false;
     }
  }

  // In development, just warn if variables are missing
  if (__DEV__ && missing.length > 0) {
    logger.warn(`Missing environment variables: ${missing.join(', ')}`);
  }

  return true;
};
