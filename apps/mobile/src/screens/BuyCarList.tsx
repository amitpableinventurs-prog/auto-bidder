import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Alert,
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { getListings, toggleFavorite, getFavorites, type ApiListing } from '../api';
import Logo from '../components/Logo';
import NeedAssistance from '../components/NeedAssistance';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';

const { width: SCREEN_W } = Dimensions.get("window");

const TAB_DATA = [
  { id: 'tell', label: 'Tell Offer', count: 8 },
  { id: 'final', label: 'Final Offer', count: 29 },
];

const BANNERS = [
  {
    id: '1',
    title: 'Own your car today! Easy and fast loans await.',
    image: 'https://img.freepik.com/free-vector/car-finance-concept-illustration_114360-8115.jpg',
  },
  {
    id: '2',
    title: 'Get the best value for your old car.',
    image: 'https://img.freepik.com/free-vector/buy-car-concept-illustration_114360-5023.jpg',
  },
];

const MOCK_LISTINGS: Partial<ApiListing>[] = [
  {
    id: 'mock1',
    title: 'Mahindra Thar (2022) Diesel 4WD MT',
    city: 'Indore',
    manufacturingYear: 2022,
    fuelType: 'Diesel',
    transmission: 'Manual',
    startingBid: 1250000,
    imageUrl: 'https://images.unsplash.com/photo-1662581876662-5cb00d87c64a?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'MP20CC****',
    kilometersDriven: 12500,
  },
  {
    id: 'mock2',
    title: 'Maruti Swift (2021) VXI',
    city: 'Bhopal',
    manufacturingYear: 2021,
    fuelType: 'Petrol',
    transmission: 'Manual',
    startingBid: 550000,
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'MP04AB****',
    kilometersDriven: 24000,
  },
  {
    id: 'mock3',
    title: 'Hyundai Creta (2023) SX(O)',
    city: 'Mumbai',
    manufacturingYear: 2023,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    startingBid: 1650000,
    imageUrl: 'https://images.unsplash.com/photo-1621259182978-f033152f53b1?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'MH01CD****',
    kilometersDriven: 8500,
  },
  {
    id: 'mock4',
    title: 'Toyota Fortuner (2022) 2.8 4x4 AT',
    city: 'Delhi',
    manufacturingYear: 2022,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    startingBid: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'DL10CE****',
    kilometersDriven: 22000,
  },
  {
    id: 'mock5',
    title: 'Honda City (2021) V CVT',
    city: 'Pune',
    manufacturingYear: 2021,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    startingBid: 1050000,
    imageUrl: 'https://images.unsplash.com/photo-1606148664166-7969a481c435?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'MH12QR****',
    kilometersDriven: 18500,
  },
  {
    id: 'mock6',
    title: 'Tata Nexon EV (2023) Max',
    city: 'Bangalore',
    manufacturingYear: 2023,
    fuelType: 'Electric',
    transmission: 'Automatic',
    startingBid: 1550000,
    imageUrl: 'https://images.unsplash.com/photo-1620282451330-467acd26cd99?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'KA05MT****',
    kilometersDriven: 5200,
  },
  {
    id: 'mock7',
    title: 'Kia Seltos (2022) HTX Plus',
    city: 'Hyderabad',
    manufacturingYear: 2022,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    startingBid: 1450000,
    imageUrl: 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'TS07ED****',
    kilometersDriven: 18000,
  },
  {
    id: 'mock8',
    title: 'MG Hector (2021) Sharp',
    city: 'Chennai',
    manufacturingYear: 2021,
    fuelType: 'Petrol',
    transmission: 'Manual',
    startingBid: 1350000,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'TN01FG****',
    kilometersDriven: 21000,
  }
];

const MOCK_FINAL_OFFERS: Partial<ApiListing>[] = [
  {
    id: 'final1',
    title: 'BMW X5 (2020) xDrive30d',
    city: 'Mumbai',
    manufacturingYear: 2020,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    startingBid: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'MH01AB****',
    kilometersDriven: 35000,
  },
  {
    id: 'final2',
    title: 'Audi A4 (2021) 40 TFSI',
    city: 'Delhi',
    manufacturingYear: 2021,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    startingBid: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'DL10XY****',
    kilometersDriven: 12000,
  },
  {
    id: 'final3',
    title: 'Mercedes-Benz C-Class (2022) C200',
    city: 'Indore',
    manufacturingYear: 2022,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    startingBid: 4800000,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    plateNumber: 'MP09AB****',
    kilometersDriven: 6000,
  }
];

export default function BuyCarList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'BuyCar'>>();
  const { filters: routeFilters } = route.params || {};
  const { selectedCity, setSelectedListing } = useAppStore();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('tell');
  const [query, setQuery] = useState(routeFilters?.search || '');
  const [listings, setListings] = useState<ApiListing[]>(MOCK_LISTINGS as ApiListing[]);
  const [loading, setLoading] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchListings();
    if (user?.id) fetchFavorites();
  }, [selectedCity, routeFilters, user?.id]);

  const fetchFavorites = async () => {
    try {
      const res = await getFavorites(user!.id);
      setFavorites(res.favorites?.map(f => f.id) || []);
    } catch (e) {
      console.warn("Failed to fetch favorites", e);
    }
  };

  const handleToggleFavorite = async (listingId: string) => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please login to save favourites.');
      return;
    }
    const wasFav = favorites.includes(listingId);
    setFavorites(prev => wasFav ? prev.filter(id => id !== listingId) : [...prev, listingId]);
    try {
      await toggleFavorite(user.id, listingId);
    } catch (e) {
      setFavorites(prev => wasFav ? [...prev, listingId] : prev.filter(id => id !== listingId));
      Alert.alert('Error', 'Could not update wishlist. Please try again.');
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCity, routeFilters]);

  const displayedListings = useMemo(() => {
    if (activeTab === 'final') {
      return MOCK_FINAL_OFFERS as ApiListing[];
    }
    return listings;
  }, [activeTab, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params: any = {
        city: selectedCity === 'Select City' ? undefined : selectedCity,
        status: 'ACTIVE',
        q: query || routeFilters?.search,
        brand: routeFilters?.brand,
        fuelType: routeFilters?.fuelType,
        transmission: routeFilters?.transmission,
        carType: routeFilters?.carType,
        minPrice: routeFilters?.minPrice ? routeFilters.minPrice * 100000 : undefined,
        maxPrice: routeFilters?.maxPrice ? routeFilters.maxPrice * 100000 : undefined,
      };

      // Force showing mock data as requested
      setListings(MOCK_LISTINGS as ApiListing[]);

      // You can uncomment the following lines to fetch from API in production
      /*
      const res = await getListings(params);
      const fetched = res.listings || [];
      if (fetched.length > 0) {
        setListings(fetched);
      }
      */
    } catch (e) {
      console.warn("Failed to fetch listings", e);
      setListings(MOCK_LISTINGS as ApiListing[]);
    } finally {
      setLoading(false);
    }
  };

  const onSelectCar = (l: ApiListing) => {
    setSelectedListing(l);
    navigation.navigate('CarDetails', { listingId: l.id });
  };

  const renderBanner = ({ item }: { item: typeof BANNERS[0] }) => (
    <View style={styles.bannerCard}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="contain" />
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
            <Ionicons name="location-sharp" size={14} color={COLORS.white} />
            <Text style={styles.cardLocationText}>{l.city || 'Indore'}</Text>
          </View>

          <View style={styles.cardStatusBadge}>
            <Text style={styles.cardStatusText}>New like</Text>
          </View>

          <View style={styles.cardIconGroup}>
             <View style={styles.cardSmallIconWrap}>
               <Ionicons name="people" size={12} color={COLORS.white} />
               <View style={styles.cardSmallIconDivider} />
               <Ionicons name="car" size={12} color={COLORS.white} />
               <View style={styles.cardSmallIconDivider} />
               <FontAwesome5 name="rupee-sign" size={10} color={COLORS.white} />
             </View>
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
               size={20}
               color={favorites.includes(l.id) ? COLORS.red : COLORS.textMuted}
             />
          </Pressable>

          <View style={styles.plateNumberBadge}>
            <Text style={styles.plateNumberText}>{l.plateNumber || 'MP20CC****'}</Text>
          </View>

          <View style={styles.closingBadge}>
            <Ionicons name="time-outline" size={14} color={COLORS.white} />
            <Text style={styles.closingText}>Closing Soon</Text>
          </View>

          <View style={styles.imagePagination}>
             <View style={[styles.dot, styles.activeDot]} />
             <View style={styles.dot} />
             <View style={styles.dot} />
             <View style={styles.dot} />
             <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.cardBody}>
           <Text style={styles.cardTitle} numberOfLines={1}>{l.title}</Text>
           <View style={styles.cardSpecs}>
              <Text style={styles.cardSpecText}>{l.kilometersDriven?.toLocaleString() || '45,455'} km</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.cardSpecText}>{l.fuelType || 'Petrol'}</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.cardSpecText}>{l.transmission || 'Manual'}</Text>
           </View>

           <View style={styles.cardPriceRow}>
              <View>
                <Text style={styles.cardPriceLabel}>Starting Bid</Text>
                <Text style={styles.cardPrice}><Text style={{ fontFamily: undefined }}>₹</Text>{(l.startingBid || 0).toLocaleString()}</Text>
              </View>
              <Pressable
                style={styles.cardActionBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('SellerMeetingOptions', {
                    listingId: l.id,
                    userId: user?.id || 'demo-user-id'
                  });
                }}
              >
                <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
                <Text style={styles.cardActionBtnText}>Schedule</Text>
              </Pressable>
           </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
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

      {/* Row 2: Menu and Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <Pressable style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Feather name="menu" size={28} color={COLORS.black2} />
          </Pressable>
          <Pressable style={styles.searchBarContainer} onPress={() => navigation.navigate('CarFilter')}>
            <View style={styles.searchInputWrapper}>
              <Feather name="search" size={20} color="#64748B" />
              <View style={styles.searchPlaceholderBox}>
                <Text style={styles.searchPlaceholderText}>Search for </Text>
                <Text style={styles.placeholderHighlight}>"SUV Cars"</Text>
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
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label} ({tab.id === 'tell' ? listings.length : MOCK_FINAL_OFFERS.length})
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <FlatList
            data={BANNERS}
            renderItem={renderBanner}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setBannerIndex(Math.round(x / SCREEN_W));
            }}
            scrollEventThrottle={16}
          />
          <View style={styles.bannerPagination}>
             {BANNERS.map((_, i) => (
               <View key={i} style={[styles.bannerDot, bannerIndex === i && styles.activeBannerDot]} />
             ))}
          </View>
        </View>

        {/* Filter Row */}
        <View style={styles.filterActionRow}>
          <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('CarFilter')}>
            <Feather name="sliders" size={18} color={COLORS.black2} />
            <Text style={styles.actionBtnText}>Filter</Text>
          </Pressable>
          <View style={styles.vDivider} />
          <Pressable style={styles.actionBtn}>
            <MaterialCommunityIcons name="swap-vertical" size={18} color={COLORS.black2} />
            <Text style={styles.actionBtnText}>Sort</Text>
          </Pressable>
          <View style={styles.vDivider} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
             <View style={[styles.chip, { backgroundColor: COLORS.lightBlue2 }]}><Text style={styles.chipText}>New like</Text></View>
             <View style={[styles.chip, { backgroundColor: COLORS.lightBlue1 }]}><Text style={styles.chipText}>Excellent</Text></View>
          </ScrollView>
        </View>

        <View style={styles.list}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgent Sell</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.secondary} size="large" style={{ marginTop: 40 }} />
          ) : displayedListings.length === 0 ? (
            <View style={styles.emptyWrap}>
                <Ionicons name="car-outline" size={64} color={COLORS.lightGrey1} />
                <Text style={styles.emptyText}>No cars found matching your criteria.</Text>
            </View>
          ) : (
            displayedListings.map((l, index) => renderCarCard(l, index))
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <NeedAssistance
            showTitle={true}
            horizontalPadding={16}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
  searchSection: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuBtn: {
    padding: 0,
  },
  searchBarContainer: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchInputWrapper: { flex: 1, flexDirection: "row", alignItems: "center" },
  searchPlaceholderBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  searchPlaceholderText: { fontSize: 16, color: COLORS.textLight, fontFamily: FONTS.openSans.regular },
  placeholderHighlight: { color: COLORS.secondary, fontSize: 16, fontFamily: FONTS.openSans.bold },
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
  scroll: { flexGrow: 1, backgroundColor: COLORS.white },
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
    paddingVertical: 15,
    gap: 12,
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
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImageContainer: { height: 220, width: '100%' },
  cardImg: { width: '100%', height: '100%' },
  cardLocationBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.black2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  cardLocationText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.openSans.bold,
  },
  cardStatusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 15,
  },
  cardStatusText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.openSans.bold,
  },
  cardIconGroup: {
    position: 'absolute',
    top: 60,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateNumberBadge: {
    position: 'absolute',
    bottom: 40,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  plateNumberText: {
    color: COLORS.black2,
    fontSize: 12,
    fontFamily: FONTS.openSans.bold,
  },
  closingBadge: {
    position: 'absolute',
    bottom: 40,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  closingText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.openSans.regular,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 12,
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
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  cardSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSpecText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.openSans.regular,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.lightGrey1,
    marginHorizontal: 8,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.openSans.regular,
  },
  cardPrice: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
  },
  cardActionBtn: {
    backgroundColor: COLORS.black2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  cardActionBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.openSans.bold,
  },
  emptyWrap: { padding: 60, alignItems: 'center', gap: 16 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center' },
});
