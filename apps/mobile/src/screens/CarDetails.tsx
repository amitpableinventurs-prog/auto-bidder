import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dimensions,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { getListing, getListings, toggleFavorite, getFavorites, type ApiListing } from '../api';
import { useAuth } from '../AuthContext';
import { useAppStore } from '../store/useAppStore';
import { socketService } from '../utils/socket';
import { getStorageItem, setStorageItem } from '../utils/storage-utils';
import StarPointsModal from '../components/StarPointsModal';
import Logo from '../components/Logo';
import NeedAssistance from '../components/NeedAssistance';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatCurrency } from '../utils/safe-formatters';

const { width: SCREEN_W } = Dimensions.get('window');

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

export default function CarDetails({ navigation, route }: any) {
  const { listingId } = route.params || {};
  const { user } = useAuth();
  const { selectedListing, selectedCity, addRecentlyViewed, setSelectedListing } = useAppStore();
  const insets = useSafeAreaInsets();

  const [activeImage, setActiveImage] = useState(0);
  const [activeCollection, setActiveCollection] = useState(0);
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isStarPointsVisible, setIsStarPointsVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [similarCars, setSimilarCars] = useState<ApiListing[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const myBid = useMemo(() => {
    if (!listing || !user?.id) return null;
    return listing.bids?.find(b => b.userId === user.id);
  }, [listing, user?.id]);

  useEffect(() => {
    if (listingId) {
      if (selectedListing && selectedListing.id === listingId) {
          setListing(selectedListing);
          setLoading(false);
          checkIfFavorite();
          fetchSimilar(selectedListing);
      } else {
          fetchListingData();
      }

      socketService.connect();
      socketService.joinAuction(listingId);

      const offBid = socketService.onBidUpdated(({ bid }) => {
          if (bid && bid.listingId === listingId) {
              fetchListingData(false);
          }
      });

      return () => {
          if (listingId) {
              offBid();
              socketService.leaveAuction(listingId);
          }
      };
    }
  }, [listingId]);

  const fetchListingData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
        const res = await getListing(listingId);
        console.log('[DEBUG] Listing Data received:', JSON.stringify(res.listing, null, 2));
        setListing(res.listing);
        setSelectedListing(res.listing);
        addRecentlyViewed(res.listing);
        checkIfFavorite();
        fetchSimilar(res.listing);
    } catch (err) {
        console.warn('Fetch listing failed', err);
    } finally {
        if (showLoading) setLoading(false);
    }
  };

  const fetchSimilar = (item: ApiListing) => {
    getListings({ brand: item.brand || '', status: 'ACTIVE' })
      .then(sRes => {
        const filtered = sRes.listings.filter(l => l.id !== listingId);
        if (filtered.length > 0) {
          setSimilarCars(filtered.slice(0, 5));
        } else if (item.city) {
          getListings({ city: item.city, status: 'ACTIVE' })
            .then(cRes => setSimilarCars(cRes.listings.filter(l => l.id !== listingId).slice(0, 5)))
            .catch(() => {});
        }
      })
      .catch(err => console.warn('Fetch similar cars failed', err));
  };

  const checkIfFavorite = async () => {
    if (!listingId) return;
    try {
      if (user?.id) {
        const res = await getFavorites(user.id);
        const isFav = res.favorites?.some(f => f.id === listingId);
        setIsFavorite(!!isFav);
      } else {
        const ids = await getStorageItem<string[]>('guest_favorites', []);
        setIsFavorite(ids.includes(listingId));
      }
    } catch (err) {
        console.warn('Check favorite failed', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!listingId) return;
    try {
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        if (user?.id) {
            const res = await toggleFavorite(user.id, listingId);
            setIsFavorite(res.isFavorite);
        } else {
            let ids = await getStorageItem<string[]>('guest_favorites', []);
            if (newStatus) {
                if (!ids.includes(listingId)) ids.push(listingId);
            } else {
                ids = ids.filter((id: string) => id !== listingId);
            }
            await setStorageItem('guest_favorites', ids);
        }
    } catch (err: any) {
        console.warn('Toggle favorite failed', err);
        setIsFavorite(!isFavorite);
    }
  };

  const images = (listing?.images && Array.isArray(listing.images) && listing.images.length > 0)
    ? listing.images
    : (listing?.imageUrl ? [listing.imageUrl] : [
        'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ]);

  const startAutoPlay = () => {
    const len = images?.length || 0;
    if (len <= 1) return;
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      let nextIndex = activeImage + 1;
      if (nextIndex >= len) {
        nextIndex = 0;
      }
      try {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      } catch (e) {
        console.warn("Hero auto-play failed", e);
      }
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [activeImage, listing, images?.length]);

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

  const overviewData = [
    { label: 'Registration Year', value: listing?.manufacturingYear?.toString() || '—' },
    { label: 'RTO', value: listing?.city || '—' },
    { label: 'Insurance Type', value: listing?.insuranceType || '—' },
    { label: 'Ownership', value: listing?.ownership || '—' },
    { label: 'Transmission', value: listing?.transmission || '—' },
    { label: 'Fuel Type', value: listing?.fuelType || '—' },
    { label: 'Color', value: listing?.color || '—' },
    { label: 'RC Availability', value: listing?.rcAvailability || 'Yes' },
    { label: 'RTO Tax Status', value: listing?.rtoTaxStatus || '—' },
    { label: 'RTO NOC Issued', value: listing?.rtoNocIssued || 'No' },
    { label: 'Bank Hypo', value: listing?.bankHypothecation ? 'Yes' : 'No' },
    { label: 'Original invoice', value: listing?.originalInvoice ? 'Yes' : 'No' },
    { label: 'Duplicate Keys', value: listing?.duplicateKeys ? 'Yes' : 'No' },
    { label: 'Service Book', value: listing?.serviceBookAvailability ? 'Yes' : 'No' },
    { label: 'OEM Warranty', value: listing?.remainingOemWarranty || '—' },
    { label: 'Condition', value: listing?.condition || 'Normal' },
    { label: 'Selling Timeline', value: listing?.sellingTimeline || '—' },
  ];

  const onBid = () => {
    if (listing) {
      setSelectedListing(listing);
      if (myBid) {
        navigation.navigate('UpdateOffer', { listingId: listing.id });
      } else {
        navigation.navigate('PlaceBid', { listingId: listing.id });
      }
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
    <ScreenWrapper style={styles.safe} scrollable={true}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, {
        paddingLeft: Math.max(insets.left, 15),
        paddingRight: Math.max(insets.right, 15)
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={26} color="#000" />
            </Pressable>
            <Logo height={30} width={130} />
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? COLORS.red : "#000"} />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={26} color="#000" />
          </Pressable>
        </View>
      </View>

      <View style={styles.heroWrap}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollToIndexFailed={(info) => {
            console.warn("Images scroll failed", info);
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            setActiveImage(Math.round(x / SCREEN_W));
          }}
          onScrollBeginDrag={stopAutoPlay}
          onScrollEndDrag={startAutoPlay}
          scrollEventThrottle={16}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.mainImage} resizeMode="cover" />
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
             <Pressable onPress={() => setIsStarPointsVisible(true)}>
                 <View style={styles.ratingBox}>
                      <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map(s => (
                              <Ionicons key={s} name="star" size={14} color={COLORS.yellow} />
                          ))}
                      </View>
                      <Ionicons name="chevron-down" size={16} color={COLORS.green} />
                 </View>
             </Pressable>
             <View style={styles.locationBadge}><Ionicons name="location-sharp" size={12} color="#FFF" /><Text style={styles.locationText}>{listing?.city || 'Indore'}</Text></View>
         </View>

         <View style={styles.titleRow}>
             <Text style={styles.carTitle}>{listing?.title || 'Mahindra Thar(2019) - AX (0) D 2WD HT'}</Text>
             {listing?.seller?.isVerified && (
                 <View style={styles.verifiedBadge}>
                     <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.green} />
                     <Text style={styles.verifiedBadgeText}>Verified Seller</Text>
                 </View>
             )}
         </View>

         <View style={styles.chipsRow}>
              <View style={styles.specChip}><Text style={styles.chipText}>{listing?.ownership || '1st Owner'}</Text></View>
              <View style={styles.specChip}><Text style={styles.chipText}>{listing?.kilometersDriven?.toLocaleString() || '45,455'} km</Text></View>
              <View style={styles.specChip}><Text style={styles.chipText}>{listing?.transmission || 'Manual'}</Text></View>
              <View style={styles.specChip}><Text style={styles.chipText}>{listing?.fuelType || 'CNG'}</Text></View>
         </View>

         <View style={styles.priceCard}>
            <View style={styles.priceCenteredRow}>
               <Text style={styles.askingLabel}>Asking Price :- </Text>
               <Text style={styles.askingValue}>{formatCurrency(listing?.demandPrice)}</Text>
            </View>
            <View style={styles.additionalCenteredRow}><Text style={styles.additionalLabel}>Additional Charges: </Text><Text style={styles.additionalValue}>₹ 37,100</Text><Ionicons name="information-circle-outline" size={14} color={COLORS.textLight} /></View>
         </View>

         {myBid && (
           <View style={styles.myOfferCard}>
              <Text style={styles.myOfferLabel}>You offered :-</Text>
              <Text style={styles.myOfferValue}>{formatCurrency(myBid.amount)}</Text>
           </View>
         )}

         <View style={styles.emiCard}>
            <View style={styles.emiMainRow}><Text style={styles.emiLabel}>EMI Starting At</Text><Text style={styles.emiValue}>₹ 13,198 /mo</Text><Ionicons name="information-circle-outline" size={16} color={COLORS.textLight} /></View>
            <View style={styles.interestBanner}>
               <Text style={styles.interestText}>Interest Rates Starting at <Text style={{fontWeight:'800'}}>10.99%</Text> on all assured cars</Text>
            </View>
         </View>

         <View style={styles.overviewSection}>
            <Text style={styles.sectionTitleLeft}>Car Overview</Text>
            <View style={styles.overviewGrid}>
               {overviewData.map((item, index) => (
                  <View key={index} style={styles.overviewItem}>
                     <Text style={styles.overviewLabel}>{item.label}:</Text>
                     <Text style={styles.overviewValue}>{item.value}</Text>
                  </View>
               ))}
            </View>
         </View>

         {similarCars.length > 0 && (
           <View style={styles.collectionsSection}>
              <Text style={styles.sectionTitle}>Similar Cars</Text>
              <FlatList
                data={similarCars}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  setActiveCollection(Math.round(x / 175)); // 160 card + 15 gap
                }}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <Pressable
                      style={styles.collectionCard}
                      onPress={() => {
                          navigation.push('CarDetails', { listingId: item.id });
                      }}
                  >
                    <Image source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&w=400&q=80' }} style={styles.collectionImg} resizeMode="cover" />
                    <View style={styles.collectionOverlay}>
                      <Text style={styles.collectionText} numberOfLines={1}>{item.title}</Text>
                      <Text style={{color: '#FFF', fontSize: 10, fontWeight: '700'}}>{formatCurrency(item.demandPrice)}</Text>
                    </View>
                  </Pressable>
                )}
                contentContainerStyle={{ paddingLeft: 15, paddingRight: 15 }}
              />
              <View style={styles.bannerDots}>
                {similarCars.map((_, i) => (
                  <View key={i} style={[styles.dot, activeCollection === i && styles.activeBannerDot]} />
                ))}
              </View>
           </View>
         )}

         <View style={styles.assistanceSection}>
            <NeedAssistance
              showTitle={true}
              horizontalPadding={0}
              onScheduleMeeting={onScheduleMeeting}
              onFAQ={() => navigation.navigate('PlaceholderScreen', { title: 'FAQs' })}
            />
         </View>
      </View>
      <View style={{ height: 100 }} />

      <View style={[styles.footerSticky, {
        paddingBottom: Math.max(insets.bottom, 15),
        paddingLeft: Math.max(insets.left, 15),
        paddingRight: Math.max(insets.right, 15)
      }]}>
         {myBid ? (
           <View style={styles.footerRow}>
              <Pressable style={[styles.bestOfferStickyBtn, { flex: 1 }]} onPress={onBid}>
                <Text style={styles.bestOfferStickyText}>UPDATE OFFER</Text>
              </Pressable>
              <Pressable style={styles.scheduleBtn} onPress={onScheduleMeeting}>
                <Text style={styles.scheduleBtnText}>SCHEDULE MEETING</Text>
              </Pressable>
           </View>
         ) : (
           <Pressable style={styles.bestOfferStickyBtn} onPress={onBid}>
              <Text style={styles.bestOfferStickyText}>TELL BEST OFFER :- {formatCurrency(listing?.demandPrice)}</Text>
           </Pressable>
         )}
      </View>

      <StarPointsModal
        visible={isStarPointsVisible}
        onClose={() => setIsStarPointsVisible(false)}
        listing={listing}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textLight, marginTop: 16, fontWeight: 'bold' },
  header: {
    height: 70,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerBtn: { padding: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  heroWrap: { height: 250, width: SCREEN_W, backgroundColor: '#000' },
  mainImage: { width: SCREEN_W, height: 250 },
  heroOverlayBottom: { position: 'absolute', bottom: 15, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plateBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  plateText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#FFF' },
  closingSoonBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  closingSoonText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  content: { padding: 15, backgroundColor: COLORS.white },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 10 },
  starsRow: { flexDirection: 'row', gap: 2 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 6 },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  carTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  specChip: { borderWidth: 1, borderColor: '#D0E1F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FFF' },
  chipText: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  myOfferCard: {
    backgroundColor: '#D6F0DB',
    borderRadius: 8,
    paddingVertical: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#4CAF50'
  },
  myOfferLabel: { fontSize: 24, fontWeight: '600', color: '#1E293B' },
  myOfferValue: { fontSize: 24, fontWeight: '700', color: '#22C55E' },
  priceCard: { backgroundColor: '#EEF4FF', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 12, marginBottom: 12 },
  priceCenteredRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  askingLabel: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  askingValue: { fontSize: 22, fontWeight: '800', color: '#22C55E' },
  additionalCenteredRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  additionalLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  additionalValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },

  emiCard: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
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

  collectionsSection: { backgroundColor: '#EEF4FF', paddingVertical: 20, marginHorizontal: -15, paddingHorizontal: 15, marginBottom: 20 },
  collectionsScroll: { marginBottom: 15 },
  collectionCard: { width: 160, height: 110, borderRadius: 12, overflow: 'hidden', marginRight: 15 },
  collectionImg: { width: '100%', height: '100%' },
  collectionOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 10 },
  collectionText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  activeBannerDot: { backgroundColor: '#1E6BD6' },

  assistanceSection: { marginBottom: 20 },

  footerSticky: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerRow: { flexDirection: 'row', gap: 12 },
  scheduleBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#2C64B4',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    backgroundColor: '#FFF'
  },
  scheduleBtnText: { color: '#2C64B4', fontWeight: '800', fontSize: 14 },
  bestOfferStickyBtn: { backgroundColor: '#FF7262', height: 54, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bestOfferStickyText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 15 },
  errorTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  errorMsg: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  backHomeBtn: { backgroundColor: '#1E6BD6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  backHomeText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
