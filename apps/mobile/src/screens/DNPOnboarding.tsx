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
        scrollEventThrottle={16}
      >
        {ONBOARDING_SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: slide.image }} style={styles.image} />
              <View style={styles.iconBadge}>
                <Ionicons name={slide.icon as any} size={32} color={COLORS.primary} />
              </View>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <Pressable
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot
              ]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'rocket' : 'arrow-forward'}
            size={20} 
            color="#fff"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    marginRight: 10,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray500,
  },
  progressContainer: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.black2,
  },
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    width: SCREEN_W * 0.8,
    height: SCREEN_W * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  contentContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    textAlign: 'center',
    color: COLORS.black2,
    marginBottom: 16,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    color: COLORS.gray600,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray300,
    marginRight: 8,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginRight: 8,
  },
});
