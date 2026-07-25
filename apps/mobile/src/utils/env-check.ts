import { Alert, BackHandler, Platform } from 'react-native';

const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0 && !__DEV__) {
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
