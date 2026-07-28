import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/AuthContext';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import { validateEnv } from './src/utils/env-check';
import { View, ActivityIndicator, LogBox } from 'react-native';
import Logo from './src/components/Logo';
import ErrorBoundary from './src/components/ErrorBoundary';

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

export default function App() {
  console.log('APP LOADED VERSION 2');
  useEffect(() => {
    // validateEnv();
  }, []);

  const [fontsLoaded] = useFonts({
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
    // validateEnv();
    registerForPushNotificationsAsync()
      .then(token => console.log('Push token:', token))
      .catch(err => console.warn('Push notification registration failed:', err));
  }, []);

  if (!fontsLoaded) {
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
