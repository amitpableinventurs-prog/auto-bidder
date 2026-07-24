import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { getListing, toggleFavorite, getFavorites, type ApiListing } from '../api';
import { useAuth } from '../AuthContext';
import { useAppStore } from '../store/useAppStore';
import StarPointsModal from '../components/StarPointsModal';
import Logo from '../components/Logo';
import NeedAssistance from '../components/NeedAssistance';
import ScreenWrapper from '../components/ScreenWrapper';
import { useResponsive, getResponsiveCardWidth } from '../utils/responsive';

const COLORS = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  primary: "#1E6BD6",
  text: "#1E293B",
  textLight: "#64748B",
  border: "#E2E8F0",
  blue: "#1E6BD6",
  lightBlue: "#EEF4FF",
  red: "#EF4444",
  green: "#22C55E",
  yellow: "#EAB308",
  grayBg: "#F1F5F9",
  dark: "#0F172A",
  orange: "#F97316",
  gold: "#FFD700",
};

export default function CarDetails() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CarDetails'>>();
  const { listingId } = route.params;
  const { width: SCREEN_W, isTablet, isDesktop, horizontalPadding } = useResponsive();
  const { user } = useAuth();
  const { selectedListing, selectedCity } = useAppStore();

  const [activeImage, setActiveImage] = useState(0);
  const [activeCollection, setActiveCollection] = useState(0);
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isStarPointsVisible, setIsStarPointsVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (listingId) {
      if (selectedListing && selectedListing.id === listingId) {
        setListing(selectedListing);
        setLoading(false);
        checkIfFavorite();
        return;
      }
      setLoading(true);
      getListing(listingId)
        .then(res => {
            setListing(res.listing);
            checkIfFavorite();
        })
        .catch(err => console.warn('Fetch listing failed', err))
        .finally(() => setLoading(false));
    }
  }, [listingId, selectedListing, user?.id]);

  const checkIfFavorite = async () => {
    if (!user?.id || !listingId) return;
    try {
        const res = await getFavorites(user.id);
        const isFav = res.favorites?.some(f => f.id === listingId);
        setIsFavorite(!!isFav);
    } catch (err) {
        console.warn('Check favorite failed', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user?.id || !listingId) return;
    try {
        const res = await toggleFavorite(user.id, listingId);
        setIsFavorite(res.isFavorite);
    } catch (err) {
        console.warn('Toggle favorite failed', err);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [activeImage, listing]);

  const startAutoPlay = () => {
    if (!images || images.length <= 1) return;
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      let nextIndex = activeImage + 1;
      if (nextIndex >= images.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const images = (listing?.images && listing.images.length > 0)
    ? listing.images
    : (listing?.imageUrl ? [listing.imageUrl] : [
        'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ]);

  if (loading) {
      return (
          <View style={[styles.loadingContainer, { backgroundColor: COLORS.bg }]}>
              <ActivityIndicator color={COLORS.blue} size="large" />
              <Text style={styles.loadingText}>Loading vehicle details...</Text>
          </View>
      );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={26} color="#000" />
          </Pressable>
          <Logo height={30} width={130} />
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={COLORS.red} />
          <Text style={styles.errorTitle}>Listing Not Found</Text>
          <Text style={styles.errorMsg}>We couldn't find the vehicle you're looking for. It might have been removed or the ID is incorrect.</Text>
          <Pressable style={styles.backHomeBtn} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Home' } } as any)}>
            <Text style={styles.backHomeText}>GO BACK HOME</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const listingDetails = listing as any;
  const overviewData = [
    { label: 'Registration Year', value: listingDetails?.registrationDate || listing?.manufacturingYear?.toString() || '—' },
    { label: 'RTO', value: listing?.city ? `${listing.city}` : '—' },
    { label: 'Insurance Till Date', value: [listing?.insuranceType, listingDetails?.insuranceExpiry].filter(Boolean).join(', ') || '—' },
    { label: 'Ownership Type', value: listingDetails?.ownershipType || 'Individual & Family Use' },
    { label: 'CNG/LPG Status', value: listingDetails?.cngLpgStatus || 'Not Applicable' },
    { label: 'Color', value: listing?.color || '—' },
    { label: 'RC Availability', value: listing?.rcAvailability || 'Yes' },
    { label: 'RTO Tax & Dues', value: listing?.rtoTaxStatus || '—' },
    { label: 'RTO NOC, for RTO', value: listingDetails?.rtoNocFor || (listing?.rtoNocIssued && listing.rtoNocIssued !== 'No' ? listing.rtoNocIssued : '—') },
    { label: 'Bank Hypothecation', value: listing?.bankHypothecation ? 'Yes' : 'No' },
    { label: 'Loan Status & NOC', value: listing?.loanStatus || '—' },
    { label: 'Service Book & Free Services', value: listing?.serviceBookAvailability ? 'Yes' : 'No' },
    { label: 'Original Invoice', value: listing?.originalInvoice ? 'Yes' : 'No' },
    { label: 'Duplicate Keys', value: listing?.duplicateKeys ? 'Yes' : 'No' },
    { label: 'OEM Warranty', value: listing?.remainingOemWarranty || '—' },
    { label: 'Vehicle Condition', value: listing?.condition || 'Normal' },
  ];

  const onBid = () => {
    if (listing) {
      navigation.navigate('PlaceBid', { listingId: listing.id });
    }
  };

  const onScheduleMeeting = () => {
    if (listing) {
      navigation.navigate('SellerMeetingOptions', {
        listingId: listing.id,
        userId: user?.id || 'demo-user-id'
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${listing?.title} on AutoBidder! Price: ₹${listing?.demandPrice?.toLocaleString()}`,
        url: 'https://autobidder.com/listing/' + listingId,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={26} color="#000" />
            </Pressable>
            <Logo height={35} width={140} />
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-sharp" size={16} color={COLORS.gold} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? COLORS.red : "#000"} />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={26} color="#000" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImage(Math.round(x / SCREEN_W));
            }}
            onScrollBeginDrag={stopAutoPlay}
            onScrollEndDrag={startAutoPlay}
            scrollEventThrottle={16}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.mainImage} />
            )}
          />

          <View style={styles.heroOverlayBottom}>
              <View style={styles.plateBadge}>
                  <Text style={styles.plateText}>{listing?.plateNumber || 'MP20CC****'}</Text>
              </View>
              <View style={styles.dots}>
                {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
                ))}
              </View>
              <View style={styles.closingSoonBadge}>
                  <Ionicons name="time-outline" size={14} color="#FFF" />
                  <Text style={styles.closingSoonText}>Closing soon</Text>
              </View>
          </View>
        </View>

        <View style={styles.content}>
           <View style={styles.infoTopRow}>
               <View style={styles.ratingBox}>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <Ionicons key={s} name="star" size={14} color={COLORS.yellow} />
                        ))}
                    </View>
                    <Ionicons name="chevron-down" size={16} color={COLORS.green} />
               </View>
               <View style={styles.locationBadge}>
                    <Ionicons name="location-sharp" size={12} color="#FFF" />
                    <Text style={styles.locationText}>{listing?.city || 'Indore'}</Text>
               </View>
           </View>

           <Text style={styles.carTitle}>{listing?.title || 'Mahindra Thar(2019) - AX (0) D 2WD HT'}</Text>

           <View style={styles.chipsRow}>
                <View style={styles.specChip}><Text style={styles.chipText}>{listing?.ownership || '1st Owner'}</Text></View>
                <View style={styles.specChip}><Text style={styles.chipText}>{listing?.kilometersDriven?.toLocaleString() || '45,455'} km</Text></View>
                <View style={styles.specChip}><Text style={styles.chipText}>{listing?.transmission || 'Manual'}</Text></View>
                <View style={styles.specChip}><Text style={styles.chipText}>{listing?.fuelType || 'CNG'}</Text></View>
           </View>

           <View style={styles.priceCard}>
              <View style={styles.priceMainRow}>
                 <Text style={styles.askingLabel}>Asking Price :-</Text>
                 <Text style={styles.askingValue}><Text style={{ fontFamily: undefined }}>₹</Text> {listing?.demandPrice?.toLocaleString() || '9,30,100'}</Text>
              </View>
              <View style={styles.additionalChargesRow}>
                 <Text style={styles.additionalLabel}>Additional Charges:</Text>
                 <Text style={styles.additionalValue}><Text style={{ fontFamily: undefined }}>₹</Text> 37,100</Text>
                 <Ionicons name="information-circle-outline" size={16} color={COLORS.textLight} />
              </View>
           </View>

           <View style={styles.emiCard}>
              <View style={styles.emiMainRow}>
                 <Text style={styles.emiLabel}>EMI Starting At</Text>
                 <Text style={styles.emiValue}><Text style={{ fontFamily: undefined }}>₹</Text> 13,198 /mo</Text>
                 <Ionicons name="information-circle-outline" size={16} color={COLORS.textLight} />
              </View>
              <View style={styles.interestBanner}>
                 <Text style={styles.interestText}>Interest Rates Starting at <Text style={{fontWeight:'800'}}>10.99%</Text> on all assured cars</Text>
              </View>
           </View>

           <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>Car Overview</Text>
              <View style={styles.overviewGrid}>
                 {overviewData.map((item, index) => (
                    <View key={index} style={styles.overviewItem}>
                       <Text style={styles.overviewLabel}>{item.label}:</Text>
                       <Text style={styles.overviewValue}>{item.value}</Text>
                    </View>
                 ))}
              </View>
           </View>

           <View style={styles.collectionsSection}>
              <Text style={styles.sectionTitle}>Car Collections</Text>
              <FlatList
                data={[
                  { id: '1', name: 'Budget Cars', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&w=400&q=80' },
                  { id: '2', name: 'SUV Cars', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
                  { id: '3', name: 'CNG', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80' },
                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  setActiveCollection(Math.round(x / 175)); // 160 card + 15 gap
                }}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.collectionCard}>
                    <Image source={{ uri: item.image }} style={styles.collectionImg} />
                    <View style={styles.collectionOverlay}><Text style={styles.collectionText}>{item.name}</Text></View>
                  </View>
                )}
                contentContainerStyle={{ paddingRight: 15 }}
              />
              <View style={styles.bannerDots}>
                {[1, 2, 3].map((_, i) => (
                  <View key={i} style={[styles.dot, activeCollection === i && styles.activeBannerDot]} />
                ))}
              </View>
           </View>

           <View style={styles.assistanceSection}>
              <NeedAssistance
                showTitle={true}
                horizontalPadding={0}
                onScheduleMeeting={onScheduleMeeting}
                onFAQ={() => (navigation as any).navigate('FAQ')}
              />
           </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footerSticky}>
         <Pressable style={styles.bestOfferStickyBtn} onPress={onBid}>
            <Text style={styles.bestOfferStickyText}>PLACE YOUR BID :- <Text style={{ fontFamily: undefined }}>₹</Text>{(listing?.demandPrice || 0).toLocaleString('en-IN')}</Text>
         </Pressable>
      </View>

      <StarPointsModal
        visible={isStarPointsVisible}
        onClose={() => setIsStarPointsVisible(false)}
        listing={listing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textLight, marginTop: 16, fontWeight: 'bold' },
  header: {
    height: 58,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerBtn: { padding: 6 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    maxWidth: 100,
  },
  locationTextHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  avatarWrapperSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    padding: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: COLORS.grayBg,
  },
  scrollContent: { backgroundColor: '#F8FAFC' },
  heroWrap: { height: 244, width: '100%', backgroundColor: '#000' },
  mainImage: { width: '100%', height: 244, resizeMode: 'cover' },
  heroOverlayBottom: { position: 'absolute', bottom: 12, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plateBadge: { backgroundColor: 'rgba(0,0,0,0.52)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  plateText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { backgroundColor: '#FFF' },
  closingSoonBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.52)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  closingSoonText: { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  content: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 0, backgroundColor: COLORS.white },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF7E8', borderWidth: 1, borderColor: '#88C36F', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, gap: 8 },
  starsRow: { flexDirection: 'row', gap: 1 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#23263A', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 5, gap: 5 },
  locationText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  carTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  specChip: { borderWidth: 1, borderColor: '#D0E1F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FFF' },
  chipText: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  myOfferCard: {
    backgroundColor: '#D5F0C7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#7BC96B'
  },
  priceCard: { backgroundColor: '#EEF4FF', borderRadius: 12, padding: 15, marginBottom: 15 },
  priceMainRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  askingLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  askingValue: { fontSize: 20, fontWeight: '800', color: COLORS.green },
  additionalChargesRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  additionalLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  additionalValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },

  emiCard: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 25 },
  emiMainRow: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 10 },
  emiLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1 },
  emiValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  interestBanner: { backgroundColor: '#1E6BD6', paddingVertical: 10, alignItems: 'center' },
  interestText: { color: '#FFF', fontSize: 12 },

  overviewSection: { marginBottom: 30 },
  sectionTitleLeft: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15, textAlign: 'left' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  overviewItem: { width: '48%', backgroundColor: '#EEF4FF', padding: 12, borderRadius: 8, marginBottom: 2 },
  overviewLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  overviewValue: { fontSize: 13, fontWeight: '700', color: '#1E293B' },

  collectionsSection: { marginBottom: 30 },
  collectionsScroll: { marginBottom: 15 },
  collectionCard: { width: 104, height: 118, borderRadius: 10, overflow: 'hidden', marginRight: 8 },
  collectionImg: { width: '100%', height: '100%' },
  collectionOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'flex-end', padding: 8 },
  collectionText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  activeBannerDot: { backgroundColor: '#1E6BD6' },

  assistanceSection: { marginBottom: 18 },

  footerSticky: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerRow: { flexDirection: 'row', gap: 12 },
  scheduleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#76A7E6',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    backgroundColor: '#FFF'
  },
  scheduleBtnText: { color: '#2C64B4', fontWeight: '800', fontSize: 11 },
  bestOfferStickyBtn: { backgroundColor: '#FF715F', height: 34, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  bestOfferStickyText: { color: '#FFF', fontWeight: '800', fontSize: 11, letterSpacing: 0.3 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 15 },
  errorTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  errorMsg: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  backHomeBtn: { backgroundColor: '#1E6BD6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  backHomeText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
