import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { logger } from './logger';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;

  if (isExpoGo) {
    logger.log('Push notifications are not supported in Expo Go on SDK 53+. Please use a development build.');
    return null;
  }

  try {
    // Dynamic require to avoid crashing if native modules are missing
    let Device;
    try {
      Device = require('expo-device');
    } catch (e) {
      console.warn('expo-device native module not found, falling back to safe defaults.');
      Device = { isDevice: Platform.OS !== 'web' };
    }

    const Notifications = require('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // The channel must exist before requesting permission on Android 8+,
    // otherwise the POST_NOTIFICATIONS prompt has no channel to attach to.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      logger.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted; skipping push token registration.');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    logger.log('Expo Push Token:', token);
    return token;
  } catch (e: any) {
    logger.warn('Push notification setup failed:', e.message);
    return null;
  }
}
