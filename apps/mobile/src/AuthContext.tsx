import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiUser, verifyOtp, setAuthToken, registerPushToken, getUser, register as apiRegister, googleAuth } from './api';
import { registerForPushNotificationsAsync } from './utils/notifications';
import { socketService } from './utils/socket';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  logout: () => void;
  login: (phone: string, otp: string, name?: string, userType?: string) => Promise<void>;
  register: (phone: string, name: string, email: string, userType: string) => Promise<void>;
  socialLogin: (email: string, name?: string, avatarUrl?: string, googleId?: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        let savedToken = null;
        if (Platform.OS === 'web') {
          savedToken = await AsyncStorage.getItem('auth_token');
        } else {
          savedToken = await SecureStore.getItemAsync('auth_token');
        }

        const savedUserJson = await AsyncStorage.getItem('auth_user');

        if (savedToken) {
          setToken(savedToken);
          setAuthToken(savedToken);
          socketService.connect(savedToken);

          if (savedUserJson) {
            const savedUser = JSON.parse(savedUserJson);
            setUser(savedUser);

            // Refresh user data from server in background
            if (savedUser?.id) {
              getUser(savedUser.id).then(res => {
                if (res.user) {
                  setUser(res.user);
                  AsyncStorage.setItem('auth_user', JSON.stringify(res.user));
                }
              }).catch(e => console.warn('Refresh user failed', e));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load auth state from storage', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorage();
  }, []);

  const login = async (phone: string, otp: string, name?: string, userType?: string) => {
    try {
      const res = await verifyOtp(phone, otp, name, userType);
      setUser(res.user);
      setToken(res.token);
      setAuthToken(res.token);
      socketService.connect(res.token);

      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('auth_token', res.token);
      } else {
        await SecureStore.setItemAsync('auth_token', res.token);
      }
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.user));

      // Register push token after login
      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          registerPushToken(pushToken, Platform.OS).catch(err => console.warn('Failed to register push token:', err));
        }
      });
    } catch (err) {
      throw err;
    }
  };

  const register = async (phone: string, name: string, email: string, userType: string) => {
    try {
      const res = await apiRegister(phone, name, email, userType);
      setUser(res.user);
      setToken(res.token);
      setAuthToken(res.token);
      socketService.connect(res.token);

      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('auth_token', res.token);
      } else {
        await SecureStore.setItemAsync('auth_token', res.token);
      }
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.user));

      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          registerPushToken(pushToken, Platform.OS).catch(err => console.warn('Failed to register push token:', err));
        }
      });
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    socketService.disconnect();
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem('auth_token');
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
    await AsyncStorage.removeItem('auth_user');
  };

  const socialLogin = async (email: string, name?: string, avatarUrl?: string, googleId?: string, phone?: string) => {
    try {
      const res = await googleAuth(email, name, avatarUrl, googleId, phone);
      setUser(res.user);
      setToken(res.token);
      setAuthToken(res.token);
      socketService.connect(res.token);

      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('auth_token', res.token);
      } else {
        await SecureStore.setItemAsync('auth_token', res.token);
      }
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.user));

      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          registerPushToken(pushToken, Platform.OS).catch(err => console.warn('Failed to register push token:', err));
        }
      });
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, isLoading, logout, login, register, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
