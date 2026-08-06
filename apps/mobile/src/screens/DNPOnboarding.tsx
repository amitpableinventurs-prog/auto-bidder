import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Turn Your Network Into Earnings',
    subtitle: 'Help sellers bring their vehicles to Auto Bidder and earn when eligible listings successfully progress through the platform.',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80',
    icon: 'car-sport',
  },
  {
    id: 2,
    title: 'Share Cars With Interested Buyers',
    subtitle: 'Choose eligible vehicle listings, share them with interested buyers, and track every lead from sharing to conversion.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    icon: 'share-social',
  },
  {
    id: 3,
    title: 'Track Every Opportunity',
    subtitle: 'Monitor shared vehicles, seller leads, buyer interest, conversions, commissions, and wallet activity in one place.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    icon: 'analytics',
  },
];

export default function DNPOnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_W, animated: true });
    } else {
      navigation.navigate('DNPActivation');
    }
  };

  const handleSkip = () => {
    navigation.navigate('DNPActivation');
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainDrawer')}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{currentIndex + 1}/{ONBOARDING_SLIDES.length}</Text>
        </View>
      </View>

      {/* Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setCurrentIndex(index);
        }}
        style={styles.slider}
      >
        {ONBOARDING_SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: SCREEN_W }]}>
            <View style={styles.slideContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={slide.icon as any} size={60} color={COLORS.secondary} />
              </View>
              
              <Image 
                source={{ uri: slide.image }} 
                style={styles.slideImage}
                resizeMode="cover"
              />
              
              <View style={styles.slideTextContainer}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <Pressable
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'arrow-forward' : 'arrow-forward'} 
            size={20} 
            color={COLORS.white} 
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.textMuted,
  },
  progressContainer: {
    backgroundColor: COLORS.lightGrey2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    fontSize: 12,
  },
  slider: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    width: SCREEN_W,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightBlue1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  slideImage: {
    width: SCREEN_W * 0.85,
    height: SCREEN_W * 0.6,
    borderRadius: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  slideTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideTitle: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightGrey1,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.secondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    fontSize: 16,
  },
});
