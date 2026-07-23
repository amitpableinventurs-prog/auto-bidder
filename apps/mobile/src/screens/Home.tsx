import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getListings, ApiListing } from '../api';
import { getMockListings } from '../utils/mockData';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import NeedAssistance from '../components/NeedAssistance';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

type Banner = {
  id: string;
  titleLines: string[];
  ctaLabel: string;
  imageUrl: string;
};

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'feature',
    titleLines: ['Feature Your', 'Listing And Sell', 'Faster!'],
    ctaLabel: 'FEATURE MY LISTING',
    imageUrl:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=70',
  },
  {
    id: 'new-cars',
    titleLines: ['Discover', 'New Cars'],
    ctaLabel: 'EXPLORE',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=70',
  },
  {
    id: 'auction',
    titleLines: ['Bid Smart,', 'Win Fast'],
    ctaLabel: 'START BIDDING',
    imageUrl:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=70',
  },
];

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [active, setActive] = useState(0);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCity } = useAppStore();
  const { user } = useAuth();

  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getListings({ city: selectedCity, status: 'ACTIVE' });
      let results = res.listings || [];

      if (results.length === 0) {
        const allRes = await getListings({ status: 'ACTIVE' });
        results = allRes.listings || [];
      }

      if (results.length === 0) {
        // Fallback to mock data
        results = getMockListings({ status: 'ACTIVE' });
      }

      setListings(results);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      // Fallback to mock data on error
      setListings(getMockListings({ status: 'ACTIVE' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [active]);

  const startAutoPlay = () => {
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      let nextIndex = active + 1;
      if (nextIndex >= DEFAULT_BANNERS.length) {
        nextIndex = 0;
      }
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_W,
        animated: true,
      });
    }, 4000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  function onHeroScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    if (idx !== active) setActive(idx);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.locationIconWrap}>
            <Ionicons name="location" size={18} color={COLORS.secondary} />
          </View>
          <Pressable onPress={() => navigation.navigate('Location', undefined)}>
            <Text style={styles.locationLabel}>Location</Text>
            <View style={styles.cityRow}>
              <Text style={styles.cityName}>{selectedCity || 'Select City'}</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.black2} />
            </View>
          </Pressable>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Notifications' } } } as any)}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.black2} />
            <View style={styles.badge} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Saved Cars' } } } as any)}>
            <Ionicons name="heart-outline" size={24} color={COLORS.black2} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Profile')}>
              <Image
                source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=vaibhav' }}
                style={styles.profileImg}
              />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Search Bar */}
        <Pressable style={styles.searchContainer} onPress={() => navigation.navigate('CarFilter')}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Search for your dream car</Text>
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={COLORS.white} />
          </View>
        </Pressable>

        {/* Hero Banner */}
        <View style={styles.heroWrap}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onHeroScroll}
            onScrollBeginDrag={stopAutoPlay}
            onScrollEndDrag={startAutoPlay}
            scrollEventThrottle={16}
          >
            {DEFAULT_BANNERS.map((b) => (
              <ImageBackground
                key={b.id}
                source={{ uri: b.imageUrl }}
                style={styles.heroSlide}
                resizeMode="cover"
              >
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  {b.titleLines.map((line, idx) => (
                    <Text key={idx} style={styles.heroTitle}>{line}</Text>
                  ))}
                  <Pressable style={styles.heroCta}>
                    <Text style={styles.heroCtaText}>{b.ctaLabel}</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                  </Pressable>
                </View>
              </ImageBackground>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {DEFAULT_BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Categories / Quick Actions */}
        <View style={styles.actionRow}><QuickAction icon="cart-outline" label="Buy Car" onPress={() => navigation.navigate('BuyCar', {})} /><QuickAction icon="cash-outline" label="Sell Car" onPress={() => navigation.navigate('MainTabs' as any)} /><QuickAction icon="time-outline" label="Live Auctions" onPress={() => navigation.navigate('LiveAuction', { listingId: 'demo' })} /><QuickAction icon="shield-checkmark-outline" label="Inspection" onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Activity' })} /></View>

        {/* Featured Auctions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Auctions</Text>
          <Pressable onPress={() => navigation.navigate('BuyCar', {})}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {loading && listings.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginVertical: 20 }} />
        ) : listings.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
            {listings.map((item) => (
              <CarCard key={item.id} car={item} onPress={() => navigation.navigate('CarDetails', { listingId: item.id })} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyWrap}>
             <Text style={styles.emptyText}>No active auctions found.</Text>
          </View>
        )}

        <NeedAssistance />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={24} color={COLORS.secondary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function CarCard({ car, onPress }: { car: ApiListing, onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: car.imageUrl || 'https://via.placeholder.com/300x200' }} style={styles.cardImage} />
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>LIVE</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{car.title}</Text>
        <Text style={styles.cardSubtitle}>{car.manufacturingYear} · {car.fuelType} · {car.transmission}</Text>
        <View style={styles.cardFooter}>
          <View>
             <Text style={styles.bidLabel}>Current Bid</Text>
             <Text style={styles.bidValue}><Text style={{ fontFamily: undefined }}>₹</Text> {car.startingBid.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.bidBtn}>
             <Text style={styles.bidBtnText}>Bid Now</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightBlue1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: -2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityName: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.lightGrey1,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coral,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  body: {
    paddingBottom: 40,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: {
    marginTop: 8,
    height: 200,
  },
  heroSlide: {
    width: SCREEN_W,
    height: 200,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.white,
    lineHeight: 30,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  heroCtaText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    left: 30,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.white,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.lightBlue1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontFamily: FONTS.poppins.medium,
    color: COLORS.black2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    color: COLORS.black2,
  },
  viewAll: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.bold,
  },
  listContainer: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 16,
  },
  card: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey2,
  },
  bidLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  bidValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
  },
  bidBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bidBtnText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
});
