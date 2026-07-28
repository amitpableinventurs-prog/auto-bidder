import { Alert } from 'react-native';

/**
 * A wrapper for API calls or any async operation that might throw.
 * Catches errors and returns a consistent result object instead of throwing.
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  errorMessage: string = 'Something went wrong'
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error: any) {
    console.error(`[SafeAsync Error]: ${errorMessage}`, error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Handles errors with a user-facing Alert if needed
 */
export function handleApiError(error: any, title: string = 'Error') {
  const message = error?.message || 'An unexpected error occurred. Please try again.';

  if (__DEV__) {
    console.warn(`[API Error] ${title}:`, error);
  }

  Alert.alert(title, message, [{ text: 'OK' }]);
}
