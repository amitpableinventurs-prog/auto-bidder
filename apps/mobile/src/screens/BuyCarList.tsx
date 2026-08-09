import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { getListings, toggleFavorite, getFavorites, type ApiListing, getSliders, ApiSlider } from '../api';
import { logger } from '../utils/logger';
import { getMockListings, MOCK_VEHICLES } from '../utils/mockData';
import Logo from '../components/Logo';
import NeedAssistance from '../components/NeedAssistance';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../AuthContext';
import { getStorageItem, setStorageItem } from '../utils/storage-utils';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT, getShadow } from '../theme';

const { width: SCREEN_W } = Dimensions.get("window");

const TAB_DATA = [
  { id: 'tell', label: 'Tell Offer' },
  { id: 'final', label: 'Final Offer' },
];

const BANNERS = [
  {
    id: '1',
    title: 'Own your car today! Easy and fast loans await.',
    image: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Get the best value for your old car.',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80',
  },
];

const MOCK_LISTINGS: ApiListing[] = MOCK_VEHICLES.filter(v => v.status === 'ACTIVE') as ApiListing[];

const MOCK_FINAL_OFFERS: ApiListing[] = MOCK_VEHICLES.filter(v => v.status === 'SOLD') as ApiListing[];

export default function BuyCarList({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { filters: routeFilters } = route.params || {};
  const { selectedCity, setSelectedListing } = useAppStore();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('tell');
  const [query, setQuery] = useState(routeFilters?.search || '');
  const [listings, setListings] = useState<ApiListing[]>(MOCK_LISTINGS);
  const [finalOfferListings, setFinalOfferListings] = useState<ApiListing[]>(MOCK_FINAL_OFFERS);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<ApiSlider[]>(BANNERS.map(b => ({ id: b.id, title: b.title, imageUrl: b.image, type: 'BUY_CAR', order: 0, isActive: true })));
  const [bannerIndex, setBannerIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState('Newest First');

  useEffect(() => {
    const startTime = Date.now();
    setLoading(true);

    Promise.all([
      fetchListings(),
      fetchFavorites(),
      fetchBanners()
    ]).finally(() => {
      setLoading(false);
      logger.perf('BuyCarList ready', Date.now() - startTime);
    });
  }, [selectedCity, routeFilters, user?.id, activeTab]);

  const fetchBanners = async () => {
    try {
      const res = await getSliders('BUY_CAR');
      if (res.sliders && res.sliders.length > 0) {
        setBanners(res.sliders);
      }
    } catch (e: any) {
      logger.warn("Failed to fetch banners in BuyCarList", e.message);
    }
  };

  const fetchFavorites = async () => {
    try {
      if (user?.id) {
        const res = await getFavorites(user.id);
        setFavorites(res.favorites?.map(f => f.id) || []);
      } else {
        const ids = await getStorageItem<string[]>('guest_favorites', []);
        setFavorites(ids);
      }
    } catch (e) {
      console.warn("Failed to fetch favorites", e);
    }
  };

  const handleToggleFavorite = async (listingId: string) => {
    try {
      const isFav = favorites.includes(listingId);
      // Optimistic update
      setFavorites(prev =>
        isFav ? prev.filter(id => id !== listingId) : [...prev, listingId]
      );

      if (user?.id) {
        const res = await toggleFavorite(user.id, listingId);
        if (res.isFavorite) {
          setFavorites(prev => prev.includes(listingId) ? prev : [...prev, listingId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== listingId));
        }
      } else {
        let ids = await getStorageItem<string[]>('guest_favorites', []);
        if (isFav) {
          ids = ids.filter((id: string) => id !== listingId);
        } else {
          ids.push(listingId);
        }
        await setStorageItem('guest_favorites', ids);
      }
    } catch (e: any) {
      console.warn("Failed to toggle favorite", e);
      // Rollback
      if (user?.id) {
          const isFav = favorites.includes(listingId);
          setFavorites(prev =>
            !isFav ? prev.filter(id => id !== listingId) : [...prev, listingId]
          );
      }
    }
  };

  const displayedListings = useMemo(() => {
    let base = activeTab === 'final' ? finalOfferListings : listings;

    let list = [...base];
    if (sortOption === 'Price: Low to High') {
      list.sort((a, b) => (a.startingBid || 0) - (b.startingBid || 0));
    } else if (sortOption === 'Price: High to Low') {
      list.sort((a, b) => (b.startingBid || 0) - (a.startingBid || 0));
    } else if (sortOption === 'KM: Low to High') {
      list.sort((a, b) => (a.kilometersDriven || 0) - (b.kilometersDriven || 0));
    } else if (sortOption === 'Year: Newest First') {
      list.sort((a, b) => (b.manufacturingYear || 0) - (a.manufacturingYear || 0));
    }
    return list;
  }, [activeTab, listings, finalOfferListings, sortOption]);

  const fetchListings = async () => {
    try {
      const status = activeTab === 'final' ? 'SOLD' : 'ACTIVE';
      const params: any = {
        city: selectedCity === 'Select City' ? undefined : selectedCity,
        status: status,
        q: query || routeFilters?.search,
        brand: routeFilters?.brand,
        fuelType: routeFilters?.fuelType,
        transmission: routeFilters?.transmission,
        carType: routeFilters?.carType,
        minPrice: routeFilters?.minPrice ? routeFilters.minPrice * 100000 : undefined,
        maxPrice: routeFilters?.maxPrice ? routeFilters.maxPrice * 100000 : undefined,
      };

      const res = await getListings(params);
      let results = res.listings || [];

      // Fallback to mock data if no listings found
      if (results.length === 0) {
        results = getMockListings({ status, brand: routeFilters?.brand });
      }

      if (activeTab === 'final') {
        setFinalOfferListings(results);
      } else {
        setListings(results);
      }
    } catch (e) {
      console.warn("Failed to fetch listings from API, using mock data", e);
      const status = activeTab === 'final' ? 'SOLD' : 'ACTIVE';
      const mockResults = getMockListings({ status, brand: routeFilters?.brand });
      if (activeTab === 'final') {
        setFinalOfferListings(mockResults);
      } else {
        setListings(mockResults);
      }
    }
  };

  const onSelectCar = (l: ApiListing) => {
    setSelectedListing(l);
    navigation.navigate('CarDetails', { listingId: l.id });
  };

  const renderBanner = ({ item }: { item: ApiSlider }) => (
    <View style={styles.bannerCard}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="contain" />
    </View>
  );

  const renderCarCard = (l: ApiListing, index: number) => {
    return (
      <Pressable
        key={l.id}
        style={styles.card}
        onPress={() => onSelectCar(l)}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: l.imageUrl || (l.images && l.images.length > 0 ? l.images[0] : null) || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardImg}
            resizeMode="cover"
          />

          <View style={styles.cardLocationBadge}>
            <Ionicons name="location-sharp" size={12} color={COLORS.white} />
            <Text style={styles.cardLocationText}>{l.city || 'Indore'}</Text>
          </View>

          <View style={[styles.cardStatusBadge, { backgroundColor: index % 4 === 0 ? '#22C55E' : index % 4 === 1 ? '#3B82F6' : index % 4 === 2 ? '#EAB308' : '#F87171' }]}>
            <Text style={styles.cardStatusText}>{index % 4 === 0 ? 'New like' : index % 4 === 1 ? 'Family owner' : index % 4 === 2 ? 'Excellent Condition' : 'Price Negotiable'}</Text>
          </View>

          <View style={styles.cardIconGroup}>
             <View style={styles.cardSmallIconWrap}><Ionicons name="people" size={12} color={COLORS.white} /><View style={styles.cardSmallIconDivider} /><Ionicons name="car" size={12} color={COLORS.white} /><View style={styles.cardSmallIconDivider} /><FontAwesome5 name="rupee-sign" size={10} color={COLORS.white} /></View>
          </View>

          <Pressable
            style={styles.wishlistBtnCard}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFavorite(l.id);
            }}
          >
             <Ionicons
               name={favorites.includes(l.id) ? "heart" : "heart-outline"}
               size={18}
               color={favorites.includes(l.id) ? COLORS.red : '#64748B'}
             />
          </Pressable>

          <View style={styles.plateNumberBadge}>
            <Text style={styles.plateNumberText}>{l.plateNumber || 'MP20CC****'}</Text>
          </View>

          <View style={styles.closingBadge}>
            <Ionicons name="time-outline" size={12} color={COLORS.white} />
            <Text style={styles.closingText}>Closing Soon</Text>
          </View>

          <View style={styles.imagePagination}>
             <View style={[styles.dot, styles.activeDot]} />
             <View style={styles.dot} />
             <View style={styles.dot} />
             <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.cardBody}>
           <Text style={styles.cardTitle} numberOfLines={1}>{l.title}</Text>
           <View style={styles.priceRow}>
              <Text style={styles.cardPrice}>₹{(l.startingBid || 0).toLocaleString()}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>{[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={12} color="#EAB308" />)}</View>
                <View style={styles.ratingBadge}><Text style={styles.ratingBadgeText}>4.8</Text></View>
              </View>
           </View>

           <View style={styles.chipsRow}>
              <View style={styles.specChip}><Text style={styles.specChipText}>1st Owner</Text></View>
              <View style={styles.specChip}><Text style={styles.specChipText}>{l.kilometersDriven?.toLocaleString() || '42,455'} km</Text></View>
              <View style={styles.specChip}><Text style={styles.specChipText}>{l.transmission || 'Manual'}</Text></View>
              <View style={styles.specChip}><Text style={styles.specChipText}>{l.fuelType || 'CNG'}</Text></View>
           </View>

           <Pressable
              style={styles.mainActionBtn}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedListing(l);
                navigation.navigate('UpdateOffer', { listingId: l.id });
              }}
           >
              <Text style={styles.mainActionBtnText}>GET BEST OFFER :- ₹{(l.startingBid || 0).toLocaleString()}</Text>
           </Pressable>

           <View style={styles.footerRow}>
              <Image source={{ uri: 'https://img.icons8.com/color/48/verified-account.png' }} style={styles.verifiedIcon} resizeMode="contain" />
              <Text style={styles.footerMsg}>RC Owner Negotiation Deal</Text>
              {l.seller?.isVerified && (
                  <View style={styles.cardVerifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                      <Text style={styles.cardVerifiedTagText}>VERIFIED</Text>
                  </View>
              )}
           </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper scrollable={false} withTabBar>
      <StatusBar style="dark" />

      {/* Header and other static content should be in ListHeaderComponent */}
      <FlatList
        data={displayedListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderCarCard(item, index)}
        ListHeaderComponent={
          <>
            {/* Header */}
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

            {/* Row 2: Menu and Search */}
            <View style={styles.searchSection}>
              <View style={styles.searchRow}>
                <Pressable style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                  <Ionicons name="menu-outline" size={32} color={COLORS.black1} />
                </Pressable>
                <Pressable style={styles.searchBarContainer} onPress={() => navigation.navigate('CarFilter')}>
                  <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={22} color={COLORS.textDim} />
                    <View style={styles.searchPlaceholderBox}>
                      <Text style={styles.searchPlaceholderText}>Search for </Text>
                      <Text style={styles.placeholderHighlight}>"New Cars"</Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {TAB_DATA.map(tab => (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                >
                  <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label} ({tab.id === 'tell' ? listings.length : finalOfferListings.length})</Text>
                </Pressable>
              ))}
            </View>

            {/* Banner */}
            {banners.length > 0 && (
              <View style={styles.bannerContainer}>
                <FlatList
                  data={banners}
                  renderItem={renderBanner}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    setBannerIndex(Math.round(x / (SCREEN_W - 32)));
                  }}
                  scrollEventThrottle={16}
                />
                <View style={styles.bannerPagination}>
                   {banners.map((_, i) => (
                     <View key={i} style={[styles.bannerDot, bannerIndex === i && styles.activeBannerDot]} />
                   ))}
                </View>
              </View>
            )}

            {/* Filter Row */}
            <View style={styles.filterActionRow}>
              <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('CarFilter')}>
                <Ionicons name="options-outline" size={18} color={COLORS.black2} />
                <Text style={styles.actionBtnText}>Filter</Text>
              </Pressable>
              <View style={styles.vDivider} />
              <Pressable style={styles.actionBtn} onPress={() => setShowSortModal(true)}>
                <MaterialCommunityIcons name="swap-vertical" size={18} color={COLORS.black2} />
                <Text style={styles.actionBtnText}>Sort</Text>
              </Pressable>
              <View style={styles.vDivider} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}><View style={[styles.chip, { backgroundColor: COLORS.lightBlue2 }]}><Text style={styles.chipText}>New like</Text></View><View style={[styles.chip, { backgroundColor: COLORS.lightBlue1 }]}><Text style={styles.chipText}>Excellent</Text></View></ScrollView>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>Urgent Sell</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={COLORS.secondary} size="large" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
                <Ionicons name="car-outline" size={64} color={COLORS.lightGrey1} />
                <Text style={styles.emptyText}>No cars found matching your criteria.</Text>
            </View>
          )
        }
        ListFooterComponent={
          <View style={{ marginTop: 20 }}>
            <NeedAssistance
              showTitle={true}
              horizontalPadding={16}
            />
          </View>
        }
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <Pressable onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>
            {[
              'Newest First',
              'Price: Low to High',
              'Price: High to Low',
              'KM: Low to High',
              'Year: Newest First',
            ].map((option) => (
              <Pressable
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortOption(option);
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortOption === option && styles.activeSortOptionText]}>
                  {option}
                </Text>
                {sortOption === option && (
                  <Ionicons name="checkmark" size={20} color={COLORS.secondary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
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
  searchSection: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGrey1,
    ...getShadow(0, 2, 0.05, 5, "#000", 2),
  },
  searchInputWrapper: { flex: 1, flexDirection: "row", alignItems: "center" },
  searchPlaceholderBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  searchPlaceholderText: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.openSans.regular },
  placeholderHighlight: { color: COLORS.secondary, fontSize: 15, fontFamily: FONTS.poppins.bold },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey1,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.black1,
  },
  tabLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.semiBold,
    fontSize: 18,
  },
  activeTabLabel: {
    color: COLORS.black1,
  },
  scroll: { flexGrow: 1, backgroundColor: COLORS.white, paddingBottom: TAB_BAR_HEIGHT + 20 },
  bannerContainer: {
    marginTop: 15,
    marginHorizontal: 16,
    height: 120,
    backgroundColor: '#E9F0F8',
    borderRadius: 15,
    overflow: 'hidden',
  },
  bannerCard: {
    width: SCREEN_W - 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    lineHeight: 24,
  },
  bannerImage: {
    width: 100,
    height: 100,
  },
  bannerPagination: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeBannerDot: {
    backgroundColor: COLORS.secondary,
    width: 12,
  },
  filterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15, gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: FONTS.openSans.semiBold,
    color: COLORS.black2,
  },
  vDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.lightGrey1,
  },
  chipScroll: {
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 14,
    fontFamily: FONTS.openSans.semiBold,
    color: COLORS.black2,
  },
  list: { paddingHorizontal: 16 },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardImageContainer: { height: 210, width: '100%' },
  cardImg: { width: '100%', height: '100%' },
  cardLocationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  cardLocationText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: FONTS.openSans.bold,
  },
  cardStatusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  cardStatusText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: FONTS.poppins.bold,
  },
  cardIconGroup: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  cardSmallIconWrap: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 15,
    alignItems: 'center',
    gap: 4,
  },
  cardSmallIconDivider: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  wishlistBtnCard: {
    position: 'absolute',
    top: 60,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  plateNumberBadge: {
    position: 'absolute',
    bottom: 35,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  plateNumberText: {
    color: COLORS.black2,
    fontSize: 11,
    fontFamily: FONTS.openSans.bold,
  },
  closingBadge: {
    position: 'absolute',
    bottom: 35,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  closingText: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: FONTS.openSans.regular,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: COLORS.white,
    width: 10,
  },
  cardBody: {
    padding: 12,
    backgroundColor: COLORS.white,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONTS.poppins.semiBold,
    color: '#334155',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: '#0F172A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingBadgeText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  specChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specChipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: FONTS.openSans.semiBold,
  },
  mainActionBtn: {
    backgroundColor: '#1E6BD6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  mainActionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  cardVerifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  cardVerifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  verifiedIcon: {
    width: 18,
    height: 18,
  },
  footerMsg: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyWrap: { padding: 60, alignItems: 'center', gap: 16 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey1,
  },
  sortOptionText: {
    fontSize: 16,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.black2,
  },
  activeSortOptionText: {
    fontFamily: FONTS.openSans.bold,
    color: COLORS.secondary,
  },
});
