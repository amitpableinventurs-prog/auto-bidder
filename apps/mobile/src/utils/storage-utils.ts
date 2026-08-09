import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/**
 * Safely parses a JSON string, returning a fallback value if parsing fails.
 */
export const safeParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return (parsed === null || parsed === undefined) ? fallback : parsed as T;
  } catch (e: any) {
    logger.error('JSON Parse Error for storage data:', e.message);
    return fallback;
  }
};

/**
 * Safely gets and parses an item from AsyncStorage.
 */
export const getStorageItem = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return safeParse(value, fallback);
  } catch (e: any) {
    logger.warn(`AsyncStorage.getItem failed for key ${key}:`, e.message);
    return fallback;
  }
};

/**
 * Safely sets an item in AsyncStorage.
 */
export const setStorageItem = async (key: string, value: any): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e: any) {
    logger.error(`AsyncStorage.setItem failed for key ${key}:`, e.message);
    return false;
  }
};
