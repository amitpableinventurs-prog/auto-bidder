import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRestart = async () => {
    try {
      if (!__DEV__ && Platform.OS !== 'web') {
        await Updates.reloadAsync();
      } else {
        this.setState({ hasError: false, error: null });
      }
    } catch (e) {
      this.setState({ hasError: false, error: null });
    }
  };

  private handleHardReset = () => {
    Alert.alert(
      'Hard Reset',
      'This will clear all local data, including your login session, and restart the app. Use this if the app is consistently crashing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & Restart',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              if (Platform.OS !== 'web') {
                await SecureStore.deleteItemAsync('auth_token');
              }
              if (!__DEV__ && Platform.OS !== 'web') {
                await Updates.reloadAsync();
              } else {
                this.setState({ hasError: false, error: null });
              }
            } catch (e) {
              console.error('Hard reset failed:', e);
            }
          }
        }
      ]
    );
  };

  private handleReport = () => {
    // This would typically send the error to Sentry, LogRocket, or a custom API
    console.log('Reporting error to server...', this.state.error);
    alert('Thank you! Our engineers have been notified.');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. We've been notified and are working on a fix.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <Text style={styles.buttonText}>Restart App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={this.handleHardReset}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Hard Reset (Clear Data)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.reportButton]} onPress={this.handleReport}>
              <Text style={[styles.buttonText, styles.reportButtonText]}>Report Issue</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <ScrollView style={styles.errorContainer}>
              <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
              <Text style={styles.stackText}>{this.state.error?.stack}</Text>
            </ScrollView>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: '#FFF8E1',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 40,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
  },
  reportButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#475569',
  },
  reportButtonText: {
    color: COLORS.primary,
  },
  errorContainer: {
    maxHeight: 200,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 8,
  },
  stackText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#64748B',
  },
});

export default ErrorBoundary;
