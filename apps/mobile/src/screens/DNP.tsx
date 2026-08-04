import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);

  const checkDnpStatus = async () => {
    try {
      const data = await request<any>('/api/dnp/status');

      if (data.status === 'ACTIVE') {
        navigation.replace('DNPDashboard');
      } else if (data.status === 'PENDING_AGREEMENT' || data.status === 'ELIGIBLE') {
        navigation.replace('DNPActivation');
      } else {
        navigation.replace('DNPOnboarding');
      }
    } catch (error) {
      console.error('Status Check Error:', error);
      navigation.replace('DNPOnboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      checkDnpStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={[TYPOGRAPHY.bodySmall, { marginTop: 12, color: COLORS.textMuted }]}>
          Loading DNP Status...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.centered}>
       <Text style={TYPOGRAPHY.bodyMedium}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
});
