import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Logo from "../components/Logo";
import NeedAssistance from "../components/NeedAssistance";
import ScreenWrapper from '../components/ScreenWrapper';
import SliderMedia from '../components/SliderMedia';
import { ALL_BRANDS } from '../utils/brands';
import { COLORS, FONTS, TAB_BAR_HEIGHT } from '../theme';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import { useAppStore } from '../store/useAppStore';
import { getBrands, getSliders, ApiSlider } from '../api';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: '1', step: 'Step 1:', title: 'Fill Car Details', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=400&q=60' },
  { id: '2', step: 'Step 2:', title: 'Add Pictures', image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=400&q=60' },
  { id: '3', step: 'Step 3:', title: 'Set Price', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=60' },
  { id: '4', step: 'Step 4:', title: 'Sell Fast', image: 'https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&w=400&q=60' },
];

const REVIEWS = [
  {
    id: '1',
    name: 'Harsh Johri',
    avatar: 'https://i.pravatar.cc/100?u=harsh',
    rating: 5,
    review: 'Learn how to navigate the car buying process with our expert tips and tricks. Learn how to navigate the car buying process with our expert tips and tricks.',
  },
  {
    id: '2',
    name: 'Ankit Sharma',
    avatar: 'https://i.pravatar.cc/100?u=ankit',
    rating: 4,
    review: 'Great experience selling my car here. The process was smooth and I got a good deal.',
  },
];

const FAQS_DATA = [
  { q: "What is Auto Bidder?", a: "Auto Bidder is a feature that automatically places bids on your behalf based on your predefined bidding rules and maximum budget." },
  { q: "How does Auto Bidder work?", a: "Once enabled, the system monitors auctions and submits bids automatically to help you stay competitive without manually placing each bid." },
  { q: "Can I set a maximum bid limit?", a: "Yes. You can define a maximum bid amount, and Auto Bidder will never exceed the limit you have specified." },
  { q: "Can I modify or stop Auto Bidder at any time?", a: "Yes. You can update your bidding preferences, adjust limits, or disable Auto Bidder whenever you want." },
  { q: "Does Auto Bidder guarantee winning an auction?", a: "No. Auto Bidder improves your chances by bidding automatically, but winning depends on factors such as competing bids, auction rules, and your maximum bid limit." },
   { q: "Is Auto Bidder secure?", a: "Yes. All bidding activities are processed securely through your account, and only the bidding parameters you configure are used by the system.." },
];

export default function SellCar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedCity } = useAppStore();
  const [regNumber, setRegNumber] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brands, setBrands] = useState<any[]>(ALL_BRANDS);
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [heroSlider, setHeroSlider] = useState<ApiSlider | null>(null);

  const stepsFlatListRef = useRef<FlatList>(null);
  const reviewsFlatListRef = useRef<FlatList>(null);
  const stepsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const STEP_ITEM_WIDTH = width * 0.4 + 12;

  useFocusEffect(
    React.useCallback(() => {
      fetchBrands();
      fetchHeroSlider();
      startStepsAutoPlay();
      startReviewsAutoPlay();
      return () => {
        stopStepsAutoPlay();
        stopReviewsAutoPlay();
      };
    }, [activeStep, activeReview])
  );

  const fetchHeroSlider = async () => {
    try {
      const res = await getSliders('SELL_CAR');
      if (res.sliders && res.sliders.length > 0) {
        setHeroSlider(res.sliders[0]);
      }
    } catch (e) {
      console.warn("Failed to fetch SELL_CAR slider", e);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await getBrands();
      if (res?.brands) {
        setBrands(res.brands);
      }
    } catch (err) {
      console.warn("Failed to fetch brands in SellCar", err);
    }
  };

  const startStepsAutoPlay = () => {
    stopStepsAutoPlay();
    stepsTimerRef.current = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % STEPS.length;
        stepsFlatListRef.current?.scrollToOffset({ offset: next * STEP_ITEM_WIDTH, animated: true });
        return next;
      });
    }, 5000);
  };

  const stopStepsAutoPlay = () => {
    if (stepsTimerRef.current) {
      clearInterval(stepsTimerRef.current);
      stepsTimerRef.current = null;
    }
  };

  const startReviewsAutoPlay = () => {
    stopReviewsAutoPlay();
    reviewsTimerRef.current = setInterval(() => {
      setActiveReview((prev) => {
        const len = REVIEWS?.length || 0;
        if (len <= 1) return 0;
        const next = (prev + 1) % len;
        try {
          reviewsFlatListRef.current?.scrollToIndex({ index: next, animated: true });
        } catch (e) {
          console.warn("Reviews auto-play failed", e);
        }
        return next;
      });
    }, 6000);
  };

  const stopReviewsAutoPlay = () => {
    if (reviewsTimerRef.current) {
      clearInterval(reviewsTimerRef.current);
      reviewsTimerRef.current = null;
    }
  };

  // Auto-detect brand based on registration number (Mock Logic)
  useEffect(() => {
    const cleanReg = regNumber.trim().toUpperCase();
    if (cleanReg.length >= 4) {
      // Deterministic mock selection for demo purposes
      let hash = 0;
      for (let i = 0; i < cleanReg.length; i++) {
        hash = cleanReg.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % brands.length;
      setSelectedBrand(brands[index].id);
    } else if (cleanReg.length === 0) {
      setSelectedBrand(null);
    }
  }, [regNumber, brands.length]);

  const handleStartSelling = () => {
    if (!regNumber.trim()) {
      Alert.alert('Required', 'Please enter your car registration number to continue.');
      return;
    }
    if (regNumber.length < 4) {
      Alert.alert('Invalid Number', 'Please enter a valid registration number.');
      return;
    }
    navigation.navigate('FillDetails', {
        listingData: {
            regNumber: regNumber.toUpperCase(),
            brand: selectedBrand || undefined
        },
        brand: selectedBrand || undefined
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredBrands = useMemo(() => {
    return brandSearch.trim()
      ? brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
      : (showAllBrands ? brands : brands.slice(0, 8));
  }, [brandSearch, showAllBrands, brands]);

  return (
    <ScreenWrapper scrollable withTabBar>
      <StatusBar style="dark" />

      {/* Header consistent with Home screen */}
      <View style={[styles.header, {
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16)
      }]}>
        <Logo height={38} width={150} />
        <View style={styles.headerRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-outline" size={16} color={COLORS.black2} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
          </Pressable>

          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Notifications' } } } as any)}>
            <View style={styles.notifWrapper}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.black2} />
              <View style={styles.notifDot} />
            </View>
          </Pressable>

          <Pressable style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/100" }}
                style={styles.avatar}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <SliderMedia
          mediaType={heroSlider?.mediaType}
          imageUrl={heroSlider?.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'}
          videoUrl={heroSlider?.videoUrl}
          isActive={true}
          style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.lightGrey1 }]}
        />
        <View style={styles.heroOverlay}>
           <Text style={styles.heroTitle}>{heroSlider?.title || 'Get The Best Price For Your Car!'}</Text>
        </View>
      </View>

      {/* Main Content Overlapping Hero */}
      <View style={styles.mainContainer}>
        {/* Registration Card */}
        <View style={styles.regCard}>
          <Text style={styles.regLabel}>Enter Registration Number</Text>
          <View style={styles.regInputRow}>
            <View style={styles.flagBox}>
              <Image source={{ uri: 'https://img.icons8.com/color/48/india.png' }} style={{ width: 24, height: 16 }} />
            </View>
          <TextInput
              value={regNumber}
              onChangeText={(t) => setRegNumber(t.toUpperCase().replace(/\s/g, ''))}
              placeholder="DL 01 AB12XX"
              placeholderTextColor={COLORS.grey}
              style={styles.regInput}
              autoCapitalize="characters"
              autoCorrect={false}
              spellCheck={false}
            />
            {regNumber.length > 0 && (
              <Pressable onPress={() => setRegNumber('')} style={{ paddingRight: 12 }}>
                <Ionicons name="close-circle" size={20} color={COLORS.grey} />
              </Pressable>
            )}
          </View>
          <Pressable style={styles.startBtn} onPress={handleStartSelling}>
            <Text style={styles.startBtnText}>START SELLING</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.line} />
          </View>

          <Text style={styles.brandPrompt}>Select Your Car brand</Text>

          {showAllBrands && (
            <View style={styles.searchRow}>
              <Ionicons name="search" size={20} color={COLORS.grey} />
              <TextInput
                placeholder="Search Brands..."
                value={brandSearch}
                onChangeText={setBrandSearch}
                style={styles.searchInput}
              />
              {brandSearch.length > 0 && (
                <Pressable onPress={() => setBrandSearch('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.grey} />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.brandGrid}>
            {filteredBrands.map(b => (
              <Pressable
                key={b.id}
                style={[styles.brandBtn, selectedBrand === b.id && styles.brandBtnActive]}
                onPress={() => {
                  setSelectedBrand(b.id);
                  navigation.navigate('FillDetails', { brand: b.id });
                }}
              >
                <Image source={typeof b.logo === 'string' ? { uri: b.logo } : b.logo} style={[styles.brandLogo, { backgroundColor: COLORS.white }]} resizeMode="contain" />
              </Pressable>
            ))}
          </View>
          {!showAllBrands && (
            <Pressable
                style={styles.viewAllBtn}
                onPress={() => setShowAllBrands(true)}
            >
               <Text style={styles.viewAllText}>VIEW ALL BRANDS</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.viewAllBtn, { marginTop: 15, backgroundColor: COLORS.lightBlue1, borderColor: COLORS.secondary }]}
            onPress={() => navigation.navigate('SellerDashboard')}
          >
             <Text style={[styles.viewAllText, { color: COLORS.secondary }]}>GO TO SELLER STUDIO</Text>
          </Pressable>
        </View>

        {/* Verification Promo Banner */}
        <View style={styles.verificationBanner}>
            <View style={styles.verificationIcon}>
               <MaterialCommunityIcons name="shield-check" size={28} color="#FFC307" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.promoTitle}>Verified Seller Program</Text>
                <Text style={styles.promoDesc}>Verified sellers get 40% higher bid conversion rates.</Text>
                <Pressable style={styles.applyBtn} onPress={() => navigation.navigate('Kyc')}>
                    <Text style={styles.applyText}>APPLY NOW {">"}</Text>
                </Pressable>
            </View>
        </View>

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Sell Your Car In 4 Easy Steps</Text>
          <FlatList
            ref={stepsFlatListRef}
            data={STEPS}
            horizontal
            pagingEnabled={false}
            snapToInterval={STEP_ITEM_WIDTH}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / STEP_ITEM_WIDTH);
              if (idx !== activeStep) setActiveStep(idx);
            }}
            onScrollBeginDrag={stopStepsAutoPlay}
            onScrollEndDrag={startStepsAutoPlay}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingLeft: 4 }}
            renderItem={({ item }) => (
              <View style={styles.stepCard}>
                <Image source={{ uri: item.image }} style={[styles.stepCardBg, { backgroundColor: COLORS.lightGrey1 }]} />
                <View style={styles.stepOverlay}>
                  <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{item.step}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.dotsRow}>
              {STEPS.map((_, i) => (
                 <View key={i} style={[styles.dot, activeStep === i && styles.dotActive]} />
              ))}
          </View>
          <Pressable style={styles.startSellingNowBtn} onPress={() => navigation.navigate('FillDetails', {})}>
             <Text style={styles.startSellingNowText}>START SELLING NOW</Text>
          </Pressable>
        </View>

        {/* Customer Reviews */}
        <View style={styles.reviewsSection}>
           <Text style={styles.sectionTitle}>Customer Review</Text>
           <FlatList
             ref={reviewsFlatListRef}
             data={REVIEWS}
             horizontal
             pagingEnabled
             showsHorizontalScrollIndicator={false}
             onScroll={(e) => {
               const x = e.nativeEvent.contentOffset.x;
               const idx = Math.round(x / (width - 32));
               if (idx !== activeReview) setActiveReview(idx);
             }}
             onScrollBeginDrag={stopReviewsAutoPlay}
             onScrollEndDrag={startReviewsAutoPlay}
             onScrollToIndexFailed={(info) => {
               console.warn("Reviews scroll failed", info);
               reviewsFlatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
             }}
             keyExtractor={item => item.id}
             renderItem={({ item }) => (
               <View style={[styles.reviewCard, { width: width - 32 }]}>
                  <View style={styles.reviewHeader}>
                     <Image source={{ uri: item.avatar }} style={[styles.reviewAvatar, { backgroundColor: COLORS.lightGrey1 }]} />
                     <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>{item.name}</Text>
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map(s => (
                             <Ionicons key={s} name={s <= item.rating ? "star" : "star-outline"} size={14} color="#FFD700" style={{ marginRight: 2 }} />
                          ))}
                        </View>
                     </View>
                     <MaterialCommunityIcons name="format-quote-close" size={40} color={COLORS.lightBlue2} />
                  </View>
                  <Text style={styles.reviewText}>{item.review}</Text>
               </View>
             )}
           />
           <View style={styles.dotsRow}>
              {REVIEWS.map((_, i) => (
                 <View key={i} style={[styles.dot, activeReview === i && styles.dotActive]} />
              ))}
           </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqsSection}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {FAQS_DATA.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Pressable style={styles.faqHeader} onPress={() => toggleFaq(index)}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons name={expandedFaq === index ? "remove" : "add"} size={24} color={COLORS.black2} />
              </Pressable>
              {expandedFaq === index && (
                <View style={styles.faqBody}>
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                </View>
              )}
              <View style={styles.faqDivider} />
            </View>
          ))}
        </View>
      </View>

      {/* Assistance Section */}
      <NeedAssistance />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { backgroundColor: '#f8fafc', paddingBottom: TAB_BAR_HEIGHT + 20 },
  header: {
    height: 64,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    maxWidth: 130,
  },
  locationTextHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black2,
    fontFamily: FONTS.poppins.bold,
  },
  iconBtn: { padding: 4 },
  notifWrapper: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coral,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  avatarBtn: { marginLeft: 2 },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: "100%", height: "100%", borderRadius: 18, backgroundColor: COLORS.lightGrey2 },

  hero: { width: '100%', height: 240 },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40
  },
  heroTitle: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
    width: '80%',
  },
  carsWrapper: { width: '100%', height: 180 },
  carsImg: { width: '100%', height: '100%' },

  mainContainer: { paddingHorizontal: 16, marginTop: -40 },
  regCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
      }
    }),
    marginBottom: 30,
  },
  regLabel: {
    fontFamily: FONTS.poppins.semiBold,
    fontSize: 14,
    color: COLORS.black2,
    marginBottom: 12
  },
  regInputRow: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  flagBox: { paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  regInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.black2
  },
  startBtn: { backgroundColor: COLORS.secondary, height: 50, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.poppins.bold },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { marginHorizontal: 10, color: COLORS.grey, fontSize: 12 },

  brandPrompt: {
    fontFamily: FONTS.poppins.semiBold,
    fontSize: 16,
    color: COLORS.black2,
    textAlign: 'center',
    marginBottom: 16
  },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  brandBtn: {
    width: '23%',
    aspectRatio: 1.3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0px 2px 5px rgba(0,0,0,0.05)' },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
      }
    }),
  },
  brandBtnActive: { borderColor: COLORS.secondary, borderWidth: 2 },
  brandLogo: { width: '70%', height: '70%' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.black2
  },
  viewAllBtn: { marginTop: 20, height: 44, borderRadius: 5, borderWidth: 1, borderColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  viewAllText: { color: COLORS.secondary, fontSize: 14, fontFamily: FONTS.poppins.bold },

  sectionTitle: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 18,
    color: COLORS.black2,
    textAlign: 'center',
    marginVertical: 20
  },
  stepsSection: { marginBottom: 30 },
  stepCard: {
    width: width * 0.4,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative'
  },
  stepCardBg: { width: '100%', height: '100%' },
  stepOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(13, 17, 33, 0.7)'
  },
  stepBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4
  },
  stepBadgeText: { color: '#fff', fontSize: 12, fontFamily: FONTS.poppins.medium },
  stepTitle: { color: '#fff', fontSize: 12, fontFamily: FONTS.poppins.semiBold },

  startSellingNowBtn: {
    backgroundColor: COLORS.coral,
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 4
  },
  startSellingNowText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.poppins.bold },

  reviewsSection: {
    backgroundColor: COLORS.lightBlue1,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 30
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }
    }),
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  reviewAvatar: { width: 48, height: 48, borderRadius: 24 },
  reviewerInfo: { flex: 1, marginLeft: 12 },
  reviewerName: { fontFamily: FONTS.poppins.bold, fontSize: 16, color: COLORS.black2 },
  starsRow: { flexDirection: 'row', marginTop: 4 },
  reviewText: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 14,
    color: COLORS.darkGrey,
    lineHeight: 22
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lightBlue2, marginHorizontal: 4 },
  dotActive: { backgroundColor: COLORS.secondary, width: 20 },

  faqsSection: { paddingVertical: 20 },
  faqItem: { marginBottom: 4 },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16
  },
  faqQuestion: {
    fontFamily: FONTS.poppins.medium,
    fontSize: 16,
    color: COLORS.black2,
    flex: 1
  },
  faqBody: { paddingBottom: 16 },
  faqAnswer: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20
  },
  faqDivider: { height: 1, backgroundColor: '#EDF2F7' },

  // Verification Banner Styles
  verificationBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  verificationIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  promoTitle: { color: COLORS.white, fontSize: 18, fontFamily: FONTS.poppins.bold },
  promoDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: FONTS.openSans.regular, marginTop: 4, lineHeight: 18 },
  applyBtn: { marginTop: 12 },
  applyText: { color: '#FFC307', fontSize: 14, fontFamily: FONTS.poppins.bold }
});
