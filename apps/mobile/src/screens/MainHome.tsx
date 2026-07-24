import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../AuthContext";
import { getListings, toggleFavorite, getFavorites, type ApiListing, ApiUser } from "../api";
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import Logo from "../components/Logo";

import { ALL_BRANDS } from "../utils/brands";
import NeedAssistance from "../components/NeedAssistance";
import { useResponsive, getResponsiveCardWidth } from '../utils/responsive';

const HERO_BANNERS = [
  { id: '1', image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", title: "Find Your Dream Car With The Best Bids", subtitle: "START BIDDING >", isAccent: true },
  { id: '2', image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80", title: "Feature Your Listing And Sell Faster!", subtitle: "FOR BEST OFFERS", isAccent: false },
];

const SERVICES = [
  {
    id: "1",
    title: "Quickly Sell Your Car",
    description: "Easily list your car and connect with interested buyers.",
    image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80",
    cta: "KNOW MORE",
  },
  {
    id: "2",
    title: "Find Your Dream Car",
    description: "Explore listings from verified owners and dealers.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
    cta: "KNOW MORE",
  },
];

const COLLECTIONS = [
  { id: "1", name: "Budget Cars", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&w=400&q=80" },
  { id: "2", name: "SUV Cars", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80" },
  { id: "3", name: "CNG Cars", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" },
];

const REVIEWS = [
  {
    id: "1",
    name: "Robin John",
    rating: 5,
    comment: "I love it and to navigate the car buying process with our expertise and more. Learn how to navigate the car buying process with our expert tips and more.",
    avatar: "https://i.pravatar.cc/150?u=robin",
  },
];

function SectionHeader({ title, viewAll, onViewAll }: { title: string; viewAll?: boolean; onViewAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {viewAll && (
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAllText}>VIEW ALL {">"}</Text>
        </Pressable>
      )}
    </View>
  );
}

function SkeletonCar() {
  return (
    <View style={[styles.carCard, { opacity: 0.5 }]}>
      <View style={[styles.carImage, { backgroundColor: '#E2E8F0' }]} />
      <View style={styles.carInfo}>
        <View style={{ height: 16, width: '80%', backgroundColor: '#E2E8F0', borderRadius: 4 }} />
        <View style={{ height: 12, width: '40%', backgroundColor: '#F1F5F9', borderRadius: 4, marginTop: 8 }} />
        <View style={{ height: 24, width: '50%', backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 12 }} />
        <View style={{ height: 36, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 6, marginTop: 15 }} />
      </View>
    </View>
  );
}

export default function MainHome() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: SCREEN_W, isTablet, isDesktop, horizontalPadding } = useResponsive();
  const { user } = useAuth();
  const { selectedCity: cityName, setSelectedListing } = useAppStore();
  const [activeHero, setActiveHero] = useState(0);
  const [activeCollection, setActiveCollection] = useState(0);
  const [activeFeatured, setActiveFeatured] = useState(0);
  const [activeReview, setActiveReview] = useState(0);
  const [featuredCars, setFeaturedCars] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const heroFlatListRef = useRef<FlatList>(null);
  const reviewsFlatListRef = useRef<FlatList>(null);
  const heroTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewsTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchFeaturedCars();
    if (user?.id) fetchFavorites();
  }, [cityName, user?.id]);

  const fetchFavorites = async () => {
    try {
      const res = await getFavorites(user!.id);
      setFavorites(res.favorites?.map(f => f.id) || []);
    } catch (e) {
      console.warn("Failed to fetch favorites", e);
    }
  };

  const handleToggleFavorite = async (listingId: string) => {
    if (!user?.id) return;
    try {
      const res = await toggleFavorite(user.id, listingId);
      if (res.isFavorite) {
        setFavorites(prev => [...prev, listingId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== listingId));
      }
    } catch (e) {
      console.warn("Failed to toggle favorite", e);
    }
  };

  useEffect(() => {
    startHeroAutoPlay();
    return () => stopHeroAutoPlay();
  }, [activeHero]);

  useEffect(() => {
    startReviewsAutoPlay();
    return () => stopReviewsAutoPlay();
  }, [activeReview]);

  const startHeroAutoPlay = () => {
    stopHeroAutoPlay();
    if (HERO_BANNERS.length <= 1) return;
    heroTimerRef.current = setInterval(() => {
      let nextIndex = activeHero + 1;
      if (nextIndex >= HERO_BANNERS.length) {
        nextIndex = 0;
      }
      heroFlatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
  };

  const stopHeroAutoPlay = () => {
    if (heroTimerRef.current) {
      clearInterval(heroTimerRef.current);
    }
  };

  const startReviewsAutoPlay = () => {
    stopReviewsAutoPlay();
    if (REVIEWS.length <= 1) return;
    reviewsTimerRef.current = setInterval(() => {
      let nextIndex = activeReview + 1;
      if (nextIndex >= REVIEWS.length) {
        nextIndex = 0;
      }
      reviewsFlatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);
  };

  const stopReviewsAutoPlay = () => {
    if (reviewsTimerRef.current) {
      clearInterval(reviewsTimerRef.current);
    }
  };

  const fetchFeaturedCars = async () => {
    const seedData: ApiListing[] = [
      {
        id: 'mock1',
        title: 'Mahindra Thar (2022) Diesel',
        demandPrice: 1550000,
        status: 'ACTIVE',
        imageUrl: 'https://images.unsplash.com/photo-1662581876662-5cb00d87c64a?auto=format&fit=crop&w=600&q=80',
        transmission: 'Manual',
        fuelType: 'Diesel',
        city: 'Indore',
        ownership: '1st Owner',
        kilometersDriven: 12000,
      } as any,
      {
        id: 'mock2',
        title: 'Maruti Swift (2021) VXI',
        demandPrice: 550000,
        status: 'ACTIVE',
        imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80',
        transmission: 'Manual',
        fuelType: 'Petrol',
        city: 'Bhopal',
        ownership: '1st Owner',
        kilometersDriven: 24000,
      } as any,
      {
        id: 'mock3',
        title: 'Hyundai Creta (2023) SX(O)',
        demandPrice: 1650000,
        status: 'ACTIVE',
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-f033152f53b1?auto=format&fit=crop&w=600&q=80',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        city: 'Mumbai',
        ownership: '1st Owner',
        kilometersDriven: 8500,
      } as any,
      {
        id: 'mock4',
        title: 'Toyota Fortuner (2022)',
        demandPrice: 3200000,
        status: 'ACTIVE',
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
        transmission: 'Automatic',
        fuelType: 'Diesel',
        city: 'Delhi',
        ownership: '1st Owner',
        kilometersDriven: 22000,
      } as any
    ];

    try {
      setLoading(true);
      const res = await getListings({ status: 'ACTIVE', city: cityName || undefined });
      const activeListings = res.listings || [];
      if (activeListings.length > 0) {
        setFeaturedCars(activeListings.slice(0, 5));
      } else {
        setFeaturedCars(seedData);
      }
    } catch (err) {
      console.warn("Failed to fetch featured cars", err);
      setFeaturedCars(seedData);
    } finally {
      setLoading(false);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_W - 30,
    offset: (SCREEN_W - 30) * index,
    index,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Logo height={40} width={160} />
        <View style={styles.headerRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-sharp" size={16} color={COLORS.gold} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{cityName || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textLight} />
          </Pressable>

          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={28} color={COLORS.black2} />
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <Pressable style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Ionicons name="menu-outline" size={32} color={COLORS.text} />
            </Pressable>
            <Pressable style={styles.searchBarContainer} onPress={() => navigation.navigate('CarFilter')}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search-outline" size={22} color="#64748B" />
                <View style={styles.searchPlaceholderBox}>
                  <Text style={styles.searchPlaceholderText}>Search for </Text>
                  <Text style={styles.placeholderHighlight}>"SUV Cars"</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Hero Banner Carousel */}
        <View style={styles.heroSection}>
          <FlatList
            ref={heroFlatListRef}
            data={HERO_BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={getItemLayout}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / (SCREEN_W - 30));
              if (idx !== activeHero) setActiveHero(idx);
            }}
            onScrollBeginDrag={stopHeroAutoPlay}
            onScrollEndDrag={startHeroAutoPlay}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_W - 30 }}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.heroImage}
                />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{item.title}</Text>
                  <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.heroPagination}>
            {HERO_BANNERS.map((_, i) => (
              <View key={i} style={[styles.heroDot, i === activeHero && styles.heroDotActive]} />
            ))}
          </View>
        </View>

        {/* Our Services */}
        <View style={styles.section}>
          <SectionHeader title="Our Services" />
          <FlatList
            data={SERVICES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <View style={styles.serviceCard}>
                <Image source={{ uri: item.image }} style={styles.serviceImage} />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.serviceDesc}>{item.description}</Text>
                </View>
                <Pressable style={styles.serviceBtn} onPress={item.id === "1" ? () => navigation.navigate('SellCarNew') : () => (navigation as any).navigate('MainTabs', { screen: 'BuyCar' })}>
                  <Text style={styles.serviceBtnText}>{item.cta}</Text>
                </Pressable>
              </View>
            )}
          />
        </View>

        {/* Car Collections */}
        <View style={styles.section}>
          <SectionHeader title="Car Collections" />
          <FlatList
            data={COLLECTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.horizontalList}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / 165); // 150 card width + 15 gap
              if (idx !== activeCollection) setActiveCollection(idx);
            }}
            renderItem={({ item }) => (
              <Pressable style={styles.collectionCard} onPress={() => (navigation as any).navigate('MainTabs', { screen: 'BuyCar', params: { filters: { carType: item.name } } })}>
                <Image source={{ uri: item.image }} style={styles.collectionImage} />
                <View style={styles.collectionOverlay}>
                  <Text style={styles.collectionName}>{item.name}</Text>
                </View>
              </Pressable>
            )}
          />
          <View style={styles.paginationDots}>
            {COLLECTIONS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeCollection && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Featured Cars */}
        <View style={styles.section}>
          <SectionHeader title="Featured Cars" viewAll onViewAll={() => (navigation as any).navigate('MainTabs', { screen: 'BuyCar' })} />
          {loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {[1, 2, 3].map(i => <SkeletonCar key={i} />)}
            </ScrollView>
          ) : (
            <FlatList
              data={featuredCars}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.horizontalList}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const idx = Math.round(x / (SCREEN_W * 0.7 + 15));
                if (idx !== activeFeatured) setActiveFeatured(idx);
              }}
              renderItem={({ item }) => (
                <Pressable style={styles.carCard} onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedListing(item);
                  navigation.navigate('CarDetails', { listingId: item.id });
                }}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{item.status === 'ACTIVE' ? 'LIVE' : 'NEW'}</Text>
                  </View>
                  <Pressable
                    style={styles.wishlistBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item.id);
                    }}
                  >
                    <Ionicons
                      name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                      size={20}
                      color={favorites.includes(item.id) ? COLORS.red : COLORS.white}
                    />
                  </Pressable>
                  <Image source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1626244795368-f9478f772712?auto=format&fit=crop&w=600&q=80" }} style={styles.carImage} />
                  <View style={styles.carInfo}>
                    <Text style={styles.carName} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>4.8</Text>
                      <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Ionicons key={s} name="star" size={12} color={COLORS.primary} />
                        ))}
                      </View>
                      <Text style={styles.reviewsText}>(2.4k Reviews)</Text>
                    </View>
                    <Text style={styles.carPrice}><Text style={{ fontFamily: undefined }}>₹</Text>{(item.demandPrice || 0).toLocaleString('en-IN')}</Text>
                    <View style={styles.carDetailsRow}>
                      <Text style={styles.carDetailText}>{item.transmission || 'Manual'}</Text>
                      <Text style={styles.carOfferText}>Get Best Offers</Text>
                    </View>
                    <Pressable style={styles.viewBtn} onPress={() => {
                      setSelectedListing(item);
                      navigation.navigate('CarDetails', { listingId: item.id });
                    }}>
                      <Text style={styles.viewBtnText}>VIEW DETAILS</Text>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            />
          )}
          <View style={styles.paginationDots}>
            {featuredCars.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeFeatured && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Explore Popular Brands */}
        <View style={styles.section}>
          <SectionHeader title="Explore Popular Brands" />
          <View style={styles.brandsGrid}>
            {(showAllBrands ? ALL_BRANDS : ALL_BRANDS.slice(0, 9)).map(brand => (
              <Pressable key={brand.id} style={styles.brandItem} onPress={() => (navigation as any).navigate('MainTabs', { screen: 'BuyCar', params: { filters: { brand: brand.name } } })}>
                <Image source={brand.logo} style={styles.brandLogo} />
                <Text style={styles.brandName}>{brand.name}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[styles.viewAllBrandsBtn, showAllBrands && { backgroundColor: '#000' }]}
            onPress={() => setShowAllBrands(!showAllBrands)}
          >
            <Text style={[styles.viewAllBrandsText, showAllBrands && { color: COLORS.secondary }]}>{showAllBrands ? "VIEW LESS" : "VIEW ALL BRANDS"}</Text>
          </Pressable>
        </View>

        {/* Customer Review */}
        <View style={styles.section}>
          <SectionHeader title="Customer Review" />
          <FlatList
            ref={reviewsFlatListRef}
            data={REVIEWS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / SCREEN_W);
              if (idx !== activeReview) setActiveReview(idx);
            }}
            onScrollBeginDrag={stopReviewsAutoPlay}
            onScrollEndDrag={startReviewsAutoPlay}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.reviewCard, { width: SCREEN_W - 30, marginHorizontal: 15 }]}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{item.name}</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name="star" size={14} color={COLORS.primary} />
                      ))}
                    </View>
                  </View>
                  <FontAwesome name="quote-right" size={30} color={COLORS.lightBlue1} style={styles.quoteIcon} />
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            )}
          />
          <View style={styles.paginationDots}>
            {REVIEWS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeReview && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Financing */}
        <View style={styles.section}>
          <SectionHeader title="Explore More" />
          <Pressable style={styles.financingBanner} onPress={() => navigation.navigate('PlaceholderScreen', { title: 'Financing' })}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" }}
              style={styles.financingBg}
            />
            <View style={styles.financingOverlay}>
              <View style={styles.financingBadge}>
                <Text style={styles.financingBadgeText}>Get Your Offers</Text>
              </View>
              <Text style={styles.financingTitle}>Get Easy Financing For Your Car</Text>
              <Text style={styles.financingLink}>APPLY FOR A LOAN {">"}</Text>
            </View>
          </Pressable>
        </View>

        {/* Assistance */}
        <NeedAssistance />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    height: 70,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: "100%", height: "100%", borderRadius: 20, backgroundColor: '#F1F5F9' },

  scrollContent: { paddingBottom: 20 },

  searchSection: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuBtn: { padding: 0 },
  searchBarContainer: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey1,
    ...Platform.select({
      web: { boxShadow: '0px 2px 5px rgba(0,0,0,0.05)' },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      }
    }),
    elevation: 2,
  },
  searchInputWrapper: { flex: 1, flexDirection: "row", alignItems: "center" },
  searchPlaceholderBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  searchPlaceholderText: { fontSize: 16, color: COLORS.textLight },
  placeholderHighlight: { color: COLORS.secondary, fontSize: 16, fontWeight: '700' },

  heroSection: { marginHorizontal: 15, height: 180, borderRadius: 12, overflow: "hidden", marginBottom: 10 },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24
  },
  heroTitle: { color: COLORS.white, fontSize: 26, fontFamily: FONTS.poppins.bold, width: "100%", lineHeight: 34 },
  heroSubtitle: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.poppins.bold, marginTop: 12 },
  heroPagination: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6
  },
  heroDot: { width: 34, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" },
  heroDotActive: { backgroundColor: COLORS.secondary },

  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  viewAllText: { color: COLORS.coral, fontSize: 12, fontWeight: "bold" },

  horizontalList: { paddingLeft: 15 },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }
    }),
  },
  serviceImage: { width: "100%", height: 140 },
  serviceInfo: { padding: 15, backgroundColor: "#eef5ff", flex: 1 },
  serviceTitle: { fontSize: 16, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  serviceDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 5, lineHeight: 18, fontFamily: FONTS.openSans.regular },
  serviceBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  serviceBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 14 },

  collectionCard: {
    width: 150,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden"
  },
  collectionImage: { width: "100%", height: "100%" },
  collectionOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    padding: 10
  },
  collectionName: { color: COLORS.white, fontSize: 14, fontFamily: FONTS.poppins.bold },

  paginationDots: { flexDirection: "row", justifyContent: "center", marginTop: 15, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lightGrey1 },
  dotActive: { backgroundColor: COLORS.secondary },

  carCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.lightGrey1
  },
  tagBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1
  },
  tagText: { color: COLORS.white, fontSize: 12, fontFamily: FONTS.poppins.bold },
  wishlistBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  carImage: { width: "100%", height: 180 },
  carInfo: { padding: 15 },
  carName: { fontSize: 16, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { fontSize: 12, color: COLORS.black2, fontFamily: FONTS.poppins.bold, marginRight: 5 },
  stars: { flexDirection: "row", gap: 2 },
  reviewsText: { fontSize: 12, color: COLORS.textMuted, marginLeft: 5, fontFamily: FONTS.openSans.regular },
  carPrice: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginTop: 10 },
  carDetailsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  carDetailText: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.openSans.regular },
  carOfferText: { fontSize: 12, color: COLORS.coral, fontFamily: FONTS.poppins.bold, textDecorationLine: "underline" },
  viewBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 15
  },
  viewBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 14 },

  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    justifyContent: "space-between",
    rowGap: 12,
  },
  brandsGridDesktop: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  brandItem: {
    width: "30%",
    backgroundColor: COLORS.lightBlue1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  brandLogo: { width: 34, height: 34 },
  brandName: { fontSize: 11, color: COLORS.black2, marginTop: 4, textAlign: "center", fontFamily: FONTS.poppins.bold },
  viewAllBrandsBtn: {
    marginHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
    backgroundColor: '#FDFEFF'
  },
  viewAllBrandsText: { color: COLORS.secondary, fontFamily: FONTS.poppins.bold, fontSize: 15, letterSpacing: 0.3 },

  reviewCard: {
    marginHorizontal: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey1
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  reviewAvatar: { width: 50, height: 50, borderRadius: 25 },
  reviewInfo: { flex: 1, marginLeft: 15 },
  reviewName: { fontSize: 16, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  quoteIcon: { opacity: 0.5 },
  reviewComment: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, fontFamily: FONTS.openSans.regular },

  financingBanner: {
    marginHorizontal: 15,
    height: 180,
    borderRadius: 12,
    overflow: "hidden"
  },
  financingBg: { width: "100%", height: "100%" },
  financingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
    justifyContent: "center"
  },
  financingBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 10
  },
  financingBadgeText: { color: COLORS.black2, fontSize: 12, fontFamily: FONTS.poppins.bold },
  financingTitle: { color: COLORS.white, fontSize: 22, fontFamily: FONTS.poppins.bold, width: "80%" },
  financingLink: { color: COLORS.white, fontSize: 14, fontFamily: FONTS.poppins.bold, marginTop: 15, textDecorationLine: "underline" },

  assistanceContainer: { marginHorizontal: 15, gap: 10 },
  assistanceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 8
  },
  assistanceTextWrap: { marginLeft: 15 },
  assistanceTitle: { color: COLORS.white, fontSize: 14, fontFamily: FONTS.poppins.bold },
  assistanceSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2, fontFamily: FONTS.openSans.regular },
});
