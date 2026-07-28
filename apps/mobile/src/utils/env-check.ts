import { Alert, BackHandler, Platform } from 'react-native';

const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

export const validateEnv = () => {
  // Hardcoded fallbacks for production build if .env injection fails
  // We use local variables to check instead of modifying process.env which might be read-only
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://autobidder.in';
  const stripeKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Pplaceholder';

  // If we are in production and both have values (either from env or fallback), we are good
  if (!__DEV__ && apiBaseUrl && stripeKey) {
    return true;
  }

  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0 && !__DEV__) {
    // If we have fallbacks, don't show the error in production
    if (apiBaseUrl && stripeKey) return true;

    console.error('MISSING ENV VARS:', missing);
    const message = `Missing required environment variables:\n${missing.join(
      '\n'
    )}\n\nPlease check your .env file and rebuild the app.`;

    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(
        'Configuration Error',
        message,
        [{ text: 'Exit', onPress: () => BackHandler.exitApp() }]
      );
    }
    return false;
  }

  return true;
};
