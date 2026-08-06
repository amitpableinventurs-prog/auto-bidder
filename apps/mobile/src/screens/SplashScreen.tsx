import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY, getShadow, FONTS } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isLoading } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'flash' | 'onboarding'>('intro');
  const [isWhite, setIsWhite] = useState(false);
  const mounted = useRef(true);

  const introAnim = useRef(new Animated.Value(0)).current;
  const carAnim = useRef(new Animated.Value(0)).current;
  const onboardingAnim = useRef(new Animated.Value(0)).current;

  // Car moves from bottom-left to top-right with a steeper rotation
  const P0 = { x: -SCREEN_W * 0.8, y: SCREEN_H * 0.9 };
  const P2 = { x: SCREEN_W * 0.8, y: -SCREEN_H * 0.9 };

  const angleRad = Math.atan2(P2.y - P0.y, P2.x - P0.x);
  // Adjusted rotation to make the car point more "upwards" and aligned
  const angleDeg = `${(angleRad * (360 / Math.PI) + 105).toFixed(2)}deg`;

  useEffect(() => {
    mounted.current = true;
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      if (!mounted.current) return;
      setPhase('flash');
      startSimpleFlash();
    });
    return () => { mounted.current = false; };
  }, []);

  const startSimpleFlash = () => {
    // Smoother movement with Easing.bezier to match a natural driving acceleration
    Animated.timing(carAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
        if (!mounted.current) return;
        setIsWhite(true);
        setTimeout(() => {
            if (!mounted.current) return;
            if (!isLoading && user) {
                navigation.replace('MainDrawer');
            } else {
                setPhase('onboarding');
                Animated.timing(onboardingAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: Platform.OS !== 'web',
                }).start();
            }
        }, 300);
    });

    // Status bar flip
    setTimeout(() => {
        if (mounted.current) {
            // setIsWhite(true); // Redundant, already set in startSimpleFlash's start callback
        }
    }, 1000);
  };

  // Intro Logo Interpolations
  const logoOpacity = introAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  const logoScale = introAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0.85, 1, 1, 1],
  });

  // Car Path Interpolations
  const carX = carAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [P0.x, P2.x],
  });
  const carY = carAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [P0.y, P2.y],
  });
  const carScale = 1.25;

  if (phase === 'intro') {
    return (
      <View style={styles.containerWhite}>
        <StatusBar style="dark" />
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
            <Image
                source={require('../../assets/utlogo.png')}
                style={{ width: SCREEN_W * 0.75, height: 120 }}
                resizeMode="contain"
            />
        </Animated.View>
      </View>
    );
  }

  if (phase === 'flash') {
      return (
          <View style={styles.flashContainer}>
              <StatusBar style={isWhite ? "dark" : "light"} />

              <Animated.Image
                source={require('../../assets/flashcar.png')}
                style={[
                    styles.flashCar,
                    {
                        transform: [
                            { translateX: carX },
                            { translateY: carY },
                            { rotate: angleDeg },
                            { scale: carScale }
                        ]
                    }
                ]}
                resizeMode="contain"
              />
          </View>
      );
  }

  return (
    <View style={styles.onboardingContainer}>
      <StatusBar style="light" />
      <Animated.View style={{ flex: 1, opacity: onboardingAnim }}>
        <ImageBackground
          source={require('../../assets/onboarding.png')}
          style={styles.fullBg}
          resizeMode="cover"
        >
          <View style={styles.darkOverlay}>
            <View style={styles.bottomContent}>
              <Text style={styles.title}>Find Your Next Car at{"\n"}Autobidder.in</Text>
              <Text style={styles.subtitle}>
                Seamless Transactions, Trusted Sellers,{"\n"}And The Perfect Car, All In One App.
              </Text>

              <Pressable style={styles.startBtn} onPress={() => navigation.navigate('Login')}>
                <View style={styles.iconCircle}>
                    <Ionicons name="flash" size={16} color="#fff" />
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
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWhite: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flashCar: {
    position: 'absolute',
    width: SCREEN_W * 0.7,
    height: SCREEN_W * 0.7,
    zIndex: 100,
  },
  onboardingContainer: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 60,
  },
  bottomContent: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    fontFamily: FONTS.poppins.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: FONTS.openSans.regular,
    textAlign: 'center',
    marginBottom: 40,
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
    ...getShadow(0, 4, 0.3, 8, COLORS.secondary, 8),
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
    fontFamily: FONTS.poppins.bold,
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 22,
    fontFamily: FONTS.openSans.regular,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: FONTS.openSans.regular,
  },
});
