import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  FlatList,
  Image,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
];

const SLIDES = [
  {
    id: '1',
    title: 'Precision Bidding',
    subtitle: 'Real-time auctions with transparent bidding history for every vehicle.',
    image: require('../../assets/Vector.png'),
  },
  {
    id: '2',
    title: 'Verified Inventory',
    subtitle: 'Every car undergoes a multi-point inspection by our expert team.',
    image: require('../../assets/Vector (1).png'),
  },
  {
    id: '3',
    title: 'Secure Payments',
    subtitle: 'End-to-end encrypted transactions and instant ownership transfer.',
    image: require('../../assets/Character.png'),
  },
];

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import * as api from "../api";

export default function PhoneLoginOnboarding() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setPhoneNumber } = useAppStore();
  const [phone, setPhone] = useState('');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);

  const [loading, setLoading] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [activeIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= SLIDES.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / SCREEN_W);
        if (index !== activeIndex) {
          setActiveIndex(index);
        }
      },
    }
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Background & Slider */}
      <View style={styles.topSection}>
        {/* Header */}
        <SafeAreaView style={styles.header} edges={['top']}>
            <Pressable onPress={() => navigation.navigate('MainDrawer')} style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('MainDrawer')} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip</Text>
            </Pressable>
        </SafeAreaView>

        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={stopAutoPlay}
          onScrollEndDrag={startAutoPlay}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * SCREEN_W,
              index * SCREEN_W,
              (index + 1) * SCREEN_W,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1, 0.8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <View style={styles.slide}>
                <Animated.View style={[styles.imageContainer, { transform: [{ scale }], opacity }]}>
                   <View style={styles.illustrationWrap}>
                      <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
                      <View style={styles.floatingIcon}>
                          <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.white} />
                      </View>
                   </View>
                </Animated.View>
                <View style={styles.slideTextWrap}>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const inputRange = [
              (i - 1) * SCREEN_W,
              i * SCREEN_W,
              (i + 1) * SCREEN_W,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity, backgroundColor: activeIndex === i ? COLORS.secondary : 'rgba(255,255,255,0.3)' }
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Bottom Login Card */}
      <View style={styles.bottomCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bottomContent}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Enter your mobile number to continue</Text>

          <View style={styles.inputContainer}>
             <View style={styles.inputRow}>
                <Pressable
                  style={styles.countryPickerBtn}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.flag}>{selectedCountry.flag}</Text>
                  <Text style={styles.prefix}>{selectedCountry.code}</Text>
                  <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                  <View style={styles.divider} />
                </Pressable>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Mobile Number"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                />
             </View>
          </View>

          {/* Country Code Modal */}
          <Modal
            visible={showCountryPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCountryPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Country</Text>
                  <Pressable onPress={() => setShowCountryPicker(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </Pressable>
                </View>
                <FlatList
                  data={COUNTRY_CODES}
                  keyExtractor={(item) => item.code + item.name}
                  renderItem={({ item }) => {
                    const isSelected = selectedCountry.code === item.code && selectedCountry.name === item.name;
                    return (
                      <Pressable
                        style={[styles.countryItem, isSelected && { backgroundColor: COLORS.lightGrey2 }]}
                        onPress={() => {
                          setSelectedCountry(item);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text style={styles.countryFlag}>{item.flag}</Text>
                        <Text style={[styles.countryName, isSelected && { fontFamily: FONTS.poppins.bold }]}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.countryCode}>{item.code}</Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} style={{ marginLeft: 8 }} />
                          )}
                        </View>
                      </Pressable>
                    );
                  }}
                />
              </View>
            </View>
          </Modal>

          <Pressable
            style={styles.whatsappRow}
            onPress={() => setWhatsappUpdates(!whatsappUpdates)}
          >
            <View style={styles.whatsappIconWrap}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <Text style={styles.whatsappText}>
                Receive instant auction updates and alerts on <Text style={{ fontFamily: FONTS.poppins.bold }}>WhatsApp</Text>
            </Text>
            <View style={[styles.checkbox, whatsappUpdates && styles.checkboxActive]}>
                {whatsappUpdates && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </Pressable>

          <Pressable
            style={[styles.primaryBtn, (loading || phone.length !== 10) && styles.btnDisabled]}
            disabled={loading}
            onPress={() => {
              if (phone.length === 10) {
                const fullPhone = `${selectedCountry.code}${phone}`;
                setPhoneNumber(fullPhone);

                console.log("Requesting OTP in background for:", fullPhone);
                // Trigger API call in background
                api.requestOtp(fullPhone).catch(err => {
                  console.warn("Background OTP request failed:", err.message);
                });

                // Navigate immediately to the OTP screen
                console.log("Navigating to Otp screen...");
                navigation.navigate('Otp', { phoneNumber: fullPhone });
              } else if (phone.length === 0) {
                Alert.alert('Required', 'Please enter your mobile number');
              } else {
                Alert.alert('Invalid', 'Please enter a valid 10-digit mobile number');
              }
            }}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.primaryBtnText}>GET OTP</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
                By continuing, you agree to our{"\n"}
                <Text style={styles.link} onPress={() => navigation.navigate('TermsOfService')}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
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
    height: SCREEN_H * 0.52,
    backgroundColor: COLORS.darkNavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  skipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  slide: {
    width: SCREEN_W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  imageContainer: {
    width: SCREEN_W * 0.85,
    height: SCREEN_H * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
<<<<<<< HEAD
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
=======
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(36, 110, 185, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTextWrap: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  slideTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    textAlign: 'center',
  },
  slideSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  bottomContent: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  loginTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.black2,
    marginBottom: 8,
  },
  loginSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
<<<<<<< HEAD
    borderRadius: 16,
    height: 64,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: COLORS.lightGrey2,
    marginBottom: 16,
=======
    borderRadius: 4,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginBottom: 24,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  flag: {
<<<<<<< HEAD
    fontSize: 20,
    marginRight: 4,
  },
  prefix: {
    fontSize: 18,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold,
    marginRight: 2,
  },
=======
    fontSize: 22,
    marginRight: 8,
  },
  prefix: {
    fontSize: 18,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold,
    marginRight: 4,
  },
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  divider: {
    width: 1.5,
    height: 28,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
<<<<<<< HEAD
    fontSize: 18,
=======
    fontSize: 16,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold,
    includeFontPadding: false,
    paddingVertical: 8,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 32,
  },
  whatsappIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  whatsappText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.black2,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  primaryBtn: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  footer: {
    marginTop: 24,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_H * 0.75,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  modalTitle: {
    ...TYPOGRAPHY.h6,
    color: COLORS.black2,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  countryFlag: {
    fontSize: 26,
    marginRight: 16,
  },
  countryName: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.black2,
  },
  countryCode: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.semiBold,
  },
});

