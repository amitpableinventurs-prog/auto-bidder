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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

import { requestOtp } from '../api';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../AuthContext';
import { logger } from '../utils/logger';

export default function Register() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setPhoneNumber } = useAppStore();
  const { socialLogin, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name) return Alert.alert('Required', 'Please enter your Full Name');
    if (!email) return Alert.alert('Required', 'Please enter your email address');
    if (!phone) return Alert.alert('Required', 'Please enter your mobile number');
    if (phone.length !== 10) return Alert.alert('Invalid', 'Please enter a valid 10-digit mobile number');

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        return Alert.alert('Invalid Email', 'Please enter a valid email address');
    }

    if (!password) return Alert.alert('Required', 'Please enter a password');
    if (password.length < 6) return Alert.alert('Weak Password', 'Password must be at least 6 characters long');
    if (password !== confirmPassword) return Alert.alert('Mismatch', 'Passwords do not match');

    const fullPhone = '+91' + phone;
    const trimmedEmail = email.trim();
    logger.log(`Registering user (${userType}):`, fullPhone);

    setLoading(true);

    try {
      await register(fullPhone, name, trimmedEmail, userType);
      setPhoneNumber(fullPhone);
      setLoading(false);

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'CompleteProfile' as any }],
            });
          }
        }
      ]);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Failed to create account. Please try again.');
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    if (provider === 'google') {
        setLoading(true);
        try {
            // Simulated Google Auth connectivity
            const demoEmail = 'newuser@google.com';
            const demoName = 'New Google User';

            await socialLogin(demoEmail, demoName, undefined, undefined, undefined, userType);

            Alert.alert('Success', 'Signed up with Google!', [
                {
                    text: 'Continue',
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'CompleteProfile' as any }],
                        });
                    }
                }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Social signup failed');
        } finally {
            setLoading(false);
        }
    } else {
        Alert.alert('Social Signup', 'Apple signup integration coming soon!');
    }
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
            <Text style={styles.subtitle}>Join Auto Bidder to start buying & selling quality cars.</Text>
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
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FULL NAME</Text>
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
                <Text style={styles.label}>EMAIL ADDRESS</Text>
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
                  <Text style={styles.prefix}>+91</Text>
                  <View style={styles.divider} />
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat your password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

              <View style={styles.socialSection}>
                <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>OR SIGN UP WITH</Text>
                    <View style={styles.orLine} />
                </View>
                <View style={styles.socialButtons}>
                    <Pressable style={styles.socialBtn} onPress={() => handleSocialSignup('google')}>
                        <Ionicons name="logo-google" size={24} color={COLORS.black2} />
                    </Pressable>
                    <Pressable style={styles.socialBtn} onPress={() => handleSocialSignup('apple')}>
                        <Ionicons name="logo-apple" size={24} color={COLORS.black2} />
                    </Pressable>
                </View>
              </View>

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
    backgroundColor: COLORS.darkNavy,
  },
  topSection: {
    height: 150,
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    marginTop: 10,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontFamily: FONTS.poppins.extraBold,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.poppins.regular,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  form: {
    gap: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
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
    backgroundColor: COLORS.lightGrey2,
  },
  typeBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  typeBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.bold,
  },
  typeBtnTextActive: {
    color: COLORS.white,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: COLORS.text,
    fontFamily: FONTS.poppins.bold,
    marginLeft: 4,
  },
  inputContainer: {
    height: 54,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGrey2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold,
  },
  prefix: {
    fontSize: 15,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold,
  },
  divider: {
    width: 1.5,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.secondary,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    letterSpacing: 1,
  },
  socialSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginHorizontal: 12,
    fontSize: 10,
    fontFamily: FONTS.poppins.bold,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  loginLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontFamily: FONTS.poppins.bold,
  },
});
