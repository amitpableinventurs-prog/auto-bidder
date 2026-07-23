import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';

import Logo from '../components/Logo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isLoading } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'onboarding'>('intro');

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-180)).current;
  const panelTranslateY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    let isMounted = true;

    // Slide logo in from top, hold, slide out downward
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoTranslateY, { toValue: 0, duration: 550, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(logoTranslateY, { toValue: 80, duration: 350, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]),
    ]).start(() => {
      if (!isMounted) return;

      if (!isLoading && user) {
        navigation.replace('MainDrawer');
        return;
      }

      setPhase('onboarding');
      // Slide onboarding panel up from bottom
      Animated.spring(panelTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    });

    return () => { isMounted = false; };
  }, []);

  // If auth resolves while on onboarding phase
  useEffect(() => {
    if (phase === 'onboarding' && !isLoading && user) {
      navigation.replace('MainDrawer');
    }
  }, [isLoading, user, phase]);

  if (phase === 'intro') {
    return (
      <View style={styles.introContainer}>
        <StatusBar style="dark" />
        <Animated.View style={{ opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] }}>
          <Logo width={SCREEN_W * 0.75} height={90} />
          <Text style={styles.introTagline}>Seamless • Trusted • Simple</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.bgContainer}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../assets/onboarding.png')}
        style={styles.fullBg}
        resizeMode="cover"
      >
        <View style={styles.darkOverlay}>
          <Animated.View
            style={[styles.bottomPanel, { transform: [{ translateY: panelTranslateY }] }]}
          >
            <Text style={styles.title}>Find Your Next Car at{"\n"}Autobidder.in</Text>
            <Text style={styles.subtitle}>
              Seamless Transactions, Trusted Sellers,{"\n"}And The Perfect Car, All In One App.
            </Text>

            <Pressable style={styles.startBtn} onPress={() => navigation.navigate('Login')}>
              <View style={styles.iconCircle}>
                <Feather name="zap" size={16} color="#fff" />
              </View>
              <Text style={styles.startBtnText}>START YOUR JOURNEY</Text>
            </Pressable>

            <View style={styles.footerLinks}>
              <Text style={styles.footerText}>By continuing, you agree to our </Text>
              <Pressable onPress={() => navigation.navigate('TermsOfService')}>
                <Text style={styles.linkText}>Terms</Text>
              </Pressable>
              <Text style={styles.footerText}> & </Text>
              <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    backgroundColor: '#FFC307',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTagline: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 12,
    textAlign: 'center',
  },
  bgContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullBg: {
    flex: 1,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomPanel: {
    backgroundColor: 'rgba(10,13,33,0.92)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 52,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    ...TYPOGRAPHY.h1,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    marginBottom: 36,
  },
  startBtn: {
    backgroundColor: COLORS.secondary,
    width: '100%',
    height: 62,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: TYPOGRAPHY.h1.fontFamily,
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.bodySmall.fontFamily,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: TYPOGRAPHY.bodySmall.fontFamily,
  },
});
