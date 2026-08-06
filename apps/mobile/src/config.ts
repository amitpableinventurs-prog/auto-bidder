import { Platform } from 'react-native';

/**
 * Centralized Configuration for Auto Bidder Mobile
 * All values should ideally be provided via EXPO_PUBLIC_ environment variables.
 */

// API and Socket URLs
const getUrl = (envVar: string | undefined, fallback: string) => {
  let url = envVar || fallback;

  // Auto-detect local development on Android Emulator
  if (Platform.OS === 'android' && url.includes('localhost')) {
    url = url.replace('localhost', '10.0.2.2');
  }

  if (url.includes('autobidder.in') && url.startsWith('http:') && !url.includes('localhost') && !url.includes('10.0.2.2')) {
    url = url.replace('http:', 'https:');
  }

  // Web check for unreachable production URL
  if (Platform.OS === 'web' && url.includes('api.autobidder.in') && __DEV__) {
     console.warn(`[CONFIG] Connecting to production API (${url}) from Web. If this fails, check your internet or update .env to localhost.`);
  }

  return url.replace(/\/$/, '');
};

export const API_BASE_URL = getUrl(process.env.EXPO_PUBLIC_API_BASE_URL, "https://api.autobidder.in");
export const SOCKET_URL = getUrl(process.env.EXPO_PUBLIC_SOCKET_URL, "https://api.autobidder.in");

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Google Maps Configuration (if used)
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// App Metadata
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Auto Bidder';
