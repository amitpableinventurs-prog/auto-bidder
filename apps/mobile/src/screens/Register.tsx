import { FONTS } from '../theme';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { height: SCREEN_H } = Dimensions.get('window');

const COLORS = {
  bg: "#0a0d14",
  white: "#ffffff",
  blue: "#2668E8",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  accent: "#FFC307",
};

import { requestOtp } from '../api';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../AuthContext';
import { Alert } from 'react-native';

export default function Register() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setPhoneNumber } = useAppStore();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'OWNER' | 'DEALER'>('OWNER');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem('distributor_referral_code').then(code => {
        if (code) setReferralCode(code);
    });
  }, []);

  const handleRegister = () => {
    if (!name) return Alert.alert('Required', 'Please enter your ' + (userType === 'DEALER' ? 'Showroom Name' : 'Full Name'));
    if (!phone) return Alert.alert('Required', 'Please enter your mobile number');
    if (phone.length !== 10) return Alert.alert('Invalid', 'Please enter a valid 10-digit mobile number');

    const fullPhone = '+91' + phone;
    console.log('Registering and requesting OTP in background for:', fullPhone);

    // Trigger API call in background
    requestOtp(phone).catch(err => {
      console.warn('Background Registration OTP request failed', err.message);
    });

    // Navigate immediately
    setPhoneNumber(fullPhone);
    setUser({ id: 'temp-id', email: '', name, userType } as any);
    navigation.navigate('Otp', { phoneNumber: fullPhone });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Header */}
      <View style={styles.topSection}>
        <SafeAreaView style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </Pressable>
        </SafeAreaView>

        <View style={styles.titleWrap}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DNP to start selling & buying quality cars.</Text>
        </View>
      </View>

      {/* White Content Area */}
      <View style={styles.content}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.form}>
              <View style={styles.typeSelector}>
                <Pressable
                  style={[styles.typeBtn, userType === 'OWNER' && styles.typeBtnActive]}
                  onPress={() => setUserType('OWNER')}
                >
                  <Ionicons name="person" size={20} color={userType === 'OWNER' ? COLORS.white : COLORS.textMuted} />
                  <Text style={[styles.typeBtnText, userType === 'OWNER' && styles.typeBtnTextActive]}>OWNER</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeBtn, userType === 'DEALER' && styles.typeBtnActive]}
                  onPress={() => setUserType('DEALER')}
                >
                  <Ionicons name="business" size={22} color={userType === 'DEALER' ? COLORS.white : COLORS.textMuted} />
                  <Text style={[styles.typeBtnText, userType === 'DEALER' && styles.typeBtnTextActive]}>DEALER</Text>
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{userType === 'DEALER' ? 'SHOWROOM NAME' : 'FULL NAME'}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS (OPTIONAL)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="example@mail.com"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>MOBILE NUMBER</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.prefix}>+91 -</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter mobile number"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>
              </View>

              <Pressable
                style={[styles.primaryBtn, (loading || !phone || !name) && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading || !phone || !name}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>CREATE ACCOUNT</Text>
                )}
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login Now</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topSection: {
    height: 180,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    fontFamily: FONTS.poppins.extraBold,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.poppins.regular,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  form: {
    gap: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeBtnActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.bold,
  },
  typeBtnTextActive: {
    color: COLORS.white,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.poppins.bold,
    marginLeft: 4,
  },
  inputContainer: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.poppins.medium,
  },
  prefix: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.medium,
  },
  primaryBtn: {
    backgroundColor: COLORS.blue,
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONTS.poppins.extraBold,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.regular,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
    fontFamily: FONTS.poppins.bold,
  },
});
