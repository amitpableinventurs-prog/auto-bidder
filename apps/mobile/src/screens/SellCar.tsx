import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Logo from "../components/Logo";
import NeedAssistance from "../components/NeedAssistance";
import { ALL_BRANDS } from '../utils/brands';
import { COLORS, FONTS } from '../theme';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import { useAppStore } from '../store/useAppStore';

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
  {
    q: "What is Auto Bidder?",
    a: "Auto Bidder is India's trusted platform for buying and selling pre-owned cars through live auctions. Sellers list their vehicles, and verified buyers bid in real-time to get the best deal — transparently and securely.",
  },
  {
    q: "How does Auto Bidder work?",
    a: "Sellers upload their car details and photos. Our team inspects and approves the listing. Buyers then place bids during the auction window. The highest bidder wins and completes the purchase through our secure process.",
  },
  {
    q: "Can I set a maximum bid limit?",
    a: "Yes. When placing a bid you can set your maximum limit. Auto Bidder will automatically bid on your behalf up to that amount, so you never miss out — even if you're not watching the auction live.",
  },
  {
    q: "Can I modify or stop Auto Bidder at any time?",
    a: "Absolutely. You can update or cancel your Auto Bidder settings at any time before the auction ends. Simply go to the listing, tap 'Update Bid', and adjust or remove your automatic bid.",
  },
  {
    q: "Does Auto Bidder guarantee winning an auction?",
    a: "No — Auto Bidder raises your bid automatically up to your limit, but if another buyer bids higher you will be outbid. It gives you the best chance of winning without constant manual monitoring.",
  },
  {
    q: "Is Auto Bidder secure?",
    a: "Yes. All transactions are protected with industry-standard encryption. Buyers and sellers are KYC-verified, and payments are held securely until both parties confirm the deal.",
  },
];

export default function SellCar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { selectedCity } = useAppStore();
  const [regNumber, setRegNumber] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const stepsFlatListRef = useRef<FlatList>(null);
  const reviewsFlatListRef = useRef<FlatList>(null);
  const stepsTimerRef = useRef<any>(null);
  const reviewsTimerRef = useRef<any>(null);

  useEffect(() => {
    startStepsAutoPlay();
    return () => stopStepsAutoPlay();
  }, [activeStep]);

  useEffect(() => {
    startReviewsAutoPlay();
    return () => stopReviewsAutoPlay();
  }, [activeReview]);

  const STEP_ITEM_WIDTH = width * 0.4 + 12;

  const startStepsAutoPlay = () => {
    stopStepsAutoPlay();
    stepsTimerRef.current = setInterval(() => {
      let nextIndex = activeStep + 1;
      if (nextIndex >= STEPS.length) nextIndex = 0;
      stepsFlatListRef.current?.scrollToOffset({ offset: nextIndex * STEP_ITEM_WIDTH, animated: true });
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
      let nextIndex = activeReview + 1;
      if (nextIndex >= REVIEWS.length) nextIndex = 0;
      reviewsFlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 6000);
  };

  const stopReviewsAutoPlay = () => {
    if (reviewsTimerRef.current) {
      clearInterval(reviewsTimerRef.current);
      reviewsTimerRef.current = null;
    }
  };

  const handleStartSelling = () => {
    if (!regNumber.trim()) {
      Alert.alert('Required', 'Please enter your car registration number to continue.');
      return;
    }
    if (regNumber.length < 4) {
      Alert.alert('Invalid Number', 'Please enter a valid registration number.');
      return;
    }
    navigation.navigate('FillDetails', { listingData: { regNumber: regNumber.toUpperCase() } });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredBrands = brandSearch.trim()
    ? ALL_BRANDS.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
    : (showAllBrands ? ALL_BRANDS : ALL_BRANDS.slice(0, 8));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header consistent with Home screen */}
      <View style={styles.header}>
        <Logo />
        <View style={styles.headerRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-sharp" size={16} color={COLORS.gold} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textLight} />
          </Pressable>

          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
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

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80' }}
          style={styles.hero}
        >
          <View style={styles.heroOverlay}>
             <Text style={styles.heroTitle}>Get The Best Price For Your Car!</Text>
          </View>
        </ImageBackground>

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
                  <Image source={b.logo} style={styles.brandLogo} resizeMode="contain" />
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
              onScrollBeginDrag={stopReviewsAutoPlay}
              onScrollEndDrag={startStepsAutoPlay}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingLeft: 4 }}
              renderItem={({ item }) => (
                <View style={styles.stepCard}>
                  <Image source={{ uri: item.image }} style={styles.stepCardBg} />
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
               onScrollToIndexFailed={() => {}}
               keyExtractor={item => item.id}
               renderItem={({ item }) => (
                 <View style={[styles.reviewCard, { width: width - 32 }]}>
                    <View style={styles.reviewHeader}>
                       <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { backgroundColor: '#f8fafc' },
  header: {
    height: 64,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
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
  },
  iconBtn: { padding: 4 },
  avatarBtn: { marginLeft: 4 },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: "100%", height: "100%", borderRadius: 20, backgroundColor: '#F1F5F9' },

  hero: { width: '100%', height: 240 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
});
