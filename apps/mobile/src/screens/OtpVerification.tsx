import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import { logger } from '../utils/logger';
import * as api from "../api";

const { width: SCREEN_W } = Dimensions.get('window');

function OtpCell({
  value,
  onChange,
  onBackspace,
  inputRef,
  isLast,
}: {
  value: string;
  onChange: (digit: string) => void;
  onBackspace: () => void;
  inputRef: React.RefObject<TextInput>;
  isLast: boolean;
}) {
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={(t) => {
        const digit = t.replace(/\D/g, '').slice(-1);
        onChange(digit);
      }}
      onKeyPress={(e) => {
        if (e.nativeEvent.key === 'Backspace') {
          onBackspace();
        }
      }}
      keyboardType="number-pad"
      returnKeyType={isLast ? 'done' : 'next'}
      maxLength={1}
      style={styles.otpCell}
      accessibilityLabel="OTP digit"
      selectTextOnFocus
      blurOnSubmit={isLast}
    />
  );
}

export default function OtpVerification() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Otp'>>();
  const { user, login } = useAuth();
  const phoneNumber = route.params?.phoneNumber || '';
  const registrationData = route.params?.registrationData;
  const userTypeParam = route.params?.userType;

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      await api.requestOTP(phoneNumber);
      Alert.alert('Success', 'OTP Resent!');
    } catch (err: any) {
      logger.warn('Resend OTP failed', err.message);
    } finally {
      setResending(false);
    }
  };

  const refs = useRef(
    Array.from({ length: 4 }, () => React.createRef<TextInput>() as React.RefObject<TextInput>)
  ).current;

  const otp = useMemo(() => digits.join(''), [digits]);
  const canVerify = otp.length === 4 && !digits.includes('');

  function setDigit(index: number, digit: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < refs.length - 1) {
      refs[index + 1]?.current?.focus();
    }
  }

  function backspace(index: number) {
    setDigits((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = '';
      } else if (index > 0) {
        next[index - 1] = '';
        refs[index - 1]?.current?.focus();
      }
      return next;
    });
  }

  async function verify() {
    if (!canVerify) {
      return Alert.alert('Required', 'Please enter complete 4-digit OTP');
    }
    if (submitting) return;
    setSubmitting(true);

    logger.log("Verifying OTP:", otp, "for", phoneNumber);

    const loginParams = registrationData
      ? [phoneNumber, otp, registrationData.name, registrationData.userType]
      : [phoneNumber, otp, user?.name || undefined, userTypeParam || (user?.userType as any) || undefined];

    // @ts-ignore - spread operator with optional arguments
    login(...loginParams)
      .then((loggedInUser: any) => {
        logger.log("OTP verified successfully");
        if (loggedInUser && loggedInUser.isVerified) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainDrawer' as any }],
          });
        } else {
          navigation.navigate('CompleteProfile');
        }
      })
      .catch(err => {
        logger.warn("OTP verification failed", err.message);
        // Bypass for development if backend is not responding
        Alert.alert(
          "Verification Error",
          "Invalid OTP or Server Unreachable. Do you want to bypass this for testing?",
          [
            { text: "Try Again", style: "cancel" },
            {
              text: "Bypass (Dev)",
              onPress: () => {
                logger.log("Bypassing verification for development");
                navigation.navigate('CompleteProfile');
              }
            }
          ]
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

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
            <Text style={styles.title}>OTP Verification</Text>
            <View style={styles.phoneRow}>
                <Text style={styles.subtitle}>Code sent to {phoneNumber} </Text>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.editLink}>Edit</Text>
                </Pressable>
            </View>
        </View>
      </View>

      {/* White Content Area */}
      <View style={styles.content}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.otpContainer}>
            <View style={styles.otpRow}>
                {digits.map((d, i) => (
                <OtpCell
                    key={i}
                    value={d}
                    inputRef={refs[i]}
                    isLast={i === digits.length - 1}
                    onChange={(digit) => setDigit(i, digit)}
                    onBackspace={() => backspace(i)}
                />
                ))}
            </View>

            <Pressable
                onPress={verify}
                disabled={!canVerify || submitting}
                style={[
                    styles.verifyBtn,
                    (!canVerify || submitting) && styles.verifyBtnDisabled,
                ]}
            >
                <Text style={styles.verifyBtnText}>
                    {submitting ? 'VERIFYING...' : 'VERIFY'}
                </Text>
            </Pressable>

            <View style={styles.footerRow}>
                <Text style={styles.footerText}>Didn't receive the code? </Text>
                <Pressable onPress={handleResend} disabled={resending}>
                <Text style={styles.resendLink}>
                    {resending ? 'Sending...' : 'Resend'}
                </Text>
                </Pressable>
            </View>
          </View>
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
    height: 180,
    backgroundColor: COLORS.darkNavy,
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
    marginTop: 20,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.7)',
  },
  editLink: {
    ...TYPOGRAPHY.bodySmall,
    color: '#D4AF37',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  otpContainer: {
    flex: 1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  otpCell: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: COLORS.white,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black1,
  },
  verifyBtn: {
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.poppins.extraBold,
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  resendLink: {
    ...TYPOGRAPHY.bodySmall,
    color: '#D4AF37',
    fontFamily: FONTS.poppins.bold,
  },
});
