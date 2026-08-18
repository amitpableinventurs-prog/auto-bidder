import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/AuthContext';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import { validateEnv } from './src/utils/env-check';
import { View, ActivityIndicator, LogBox, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Logo from './src/components/Logo';
import ErrorBoundary from './src/components/ErrorBoundary';
import { COLORS, TYPOGRAPHY } from './src/theme';
import StripeProviderWrapper from './src/components/StripeProviderWrapper';
import { STRIPE_PUBLISHABLE_KEY } from './src/config';

// Global error handler for JS exceptions outside of React
if (typeof ErrorUtils !== 'undefined') {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('GLOBAL JS ERROR:', error, 'isFatal:', isFatal);
    // You could report to Sentry/Crashlytics here
    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

// Ignore specific warnings if necessary
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black
} from '@expo-google-fonts/poppins';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold
} from '@expo-google-fonts/open-sans';

import { API_BASE_URL } from './src/config';

export default function App() {
  const [configValid, setConfigValid] = React.useState(true);
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold
  });

  useEffect(() => {
    if (fontError) {
      console.warn('Font loading failed (Web timeout likely), continuing with system fonts:', fontError);
    }
  }, [fontError]);

  const appIsReady = fontsLoaded || fontError || Platform.OS === 'web';

  useEffect(() => {
    async function setupApp() {
      try {
        const isValid = validateEnv();
        if (!isValid) {
          setConfigValid(false);
          return;
        }

        await registerForPushNotificationsAsync()
          .then(token => console.log('Push token:', token))
          .catch(err => console.warn('Push notification registration failed (handled):', err));
      } catch (e) {
        console.error('Startup validation failed:', e);
      }
    }
    setupApp();
  }, []);

  if (!configValid) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Configuration Error</Text>
        <Text style={styles.errorText}>
          The application is missing critical production environment variables.
          Please check your build configuration.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setConfigValid(validateEnv())}
        >
          <Text style={styles.retryButtonText}>Retry Validation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <View style={{ marginBottom: 20 }}>
           <Logo width={200} height={60} />
        </View>
        <ActivityIndicator size="large" color="#FFC307" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StripeProviderWrapper publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AuthProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </AuthProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </StripeProviderWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: '#DC2626',
    marginBottom: 16,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
