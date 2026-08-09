import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../AuthContext";
import { getListings, toggleFavorite, getFavorites, type ApiListing, ApiUser, getSliders, ApiSlider, getBrands, getCollections, ApiCollection } from "../api";
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT, getShadow } from '../theme';
import { logger } from '../utils/logger';
import Logo from "../components/Logo";
import * as Linking from 'expo-linking';
import { getStorageItem, setStorageItem } from '../utils/storage-utils';
import ScreenWrapper from "../components/ScreenWrapper";

import { ALL_BRANDS } from "../utils/brands";
import NeedAssistance from "../components/NeedAssistance";

const { width: SCREEN_W } = Dimensions.get("window");

const DEFAULT_HERO_BANNERS = [
  { id: '1', image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", title: "Find Your Dream Car With The Best Bids", subtitle: "START BIDDING >", isAccent: true, link: '/BuyCar' },
  { id: '2', image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80", title: "Feature Your Listing And Sell Faster!", subtitle: "FEATURE MY LISTING >", isAccent: false, link: '/SellCar' },
];

// Local fallback banners in case remote fetch fails
const FALLBACK_HERO_BANNERS = [
  { id: 'fb1', image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", title: "Find Your Dream Car", subtitle: "START BIDDING >", isAccent: true, link: '/BuyCar' },
  { id: 'fb2', image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80", title: "Feature Your Listing And Sell Faster!", subtitle: "FEATURE MY LISTING >", isAccent: false, link: '/SellCar' },
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

const DEFAULT_COLLECTIONS = [
  { id: "1", name: "Budget Cars", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&w=400&q=80" },
  { id: "2", name: "SUV Cars", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80" },
  { id: "3", name: "CNG Cars", imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" },
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

const SEED_DATA: ApiListing[] = [
  {
    id: 'seed1',
    title: '2022 Honda City ZX',
    imageUrl: 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=600&q=80',
    demandPrice: 1250000,
    startingBid: 1100000,
    transmission: 'Automatic',
    status: 'ACTIVE',
    fuelType: 'Petrol',
    manufacturingYear: 2022,
    images: [],
    kilometersDriven: 15000,
    city: 'Mumbai',
    sellerId: 's1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed2',
    title: '2021 Hyundai Creta SX',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
    demandPrice: 1450000,
    startingBid: 1300000,
    transmission: 'Manual',
    status: 'ACTIVE',
    fuelType: 'Diesel',
    manufacturingYear: 2021,
    images: [],
    kilometersDriven: 25000,
    city: 'Delhi',
    sellerId: 's2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed3',
    title: '2023 Maruti Swift VXI',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    demandPrice: 650000,
    startingBid: 580000,
    transmission: 'Manual',
    status: 'ACTIVE',
    fuelType: 'CNG',
    manufacturingYear: 2023,
    images: [],
    kilometersDriven: 5000,
    city: 'Indore',
    sellerId: 's3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
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

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MainHome({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedCity: cityName, setSelectedListing } = useAppStore();
  const [heroBanners, setHeroBanners] = useState<any[]>(DEFAULT_HERO_BANNERS);
  const [activeHero, setActiveHero] = useState(0);
  const [activeCollection, setActiveCollection] = useState(0);
  const [activeFeatured, setActiveFeatured] = useState(0);
  const [activeReview, setActiveReview] = useState(0);
  const [featuredCars, setFeaturedCars] = useState<ApiListing[]>([]);
  const [brands, setBrands] = useState<any[]>(ALL_BRANDS);
  const [collections, setCollections] = useState<ApiCollection[]>(DEFAULT_COLLECTIONS as any);
  const [loading, setLoading] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const heroFlatListRef = useRef<FlatList>(null);
  const reviewsFlatListRef = useRef<FlatList>(null);
  const heroTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
        const startTime = Date.now();
        logger.log('Home screen fetching started');

        Promise.all([
          fetchHeroBanners(),
          fetchFeaturedCars(),
          fetchFavorites(),
          fetchBrands(),
          fetchCollectionsData()
        ]).then(() => {
          logger.perf('Home screen ready', Date.now() - startTime);
        });

        startHeroAutoPlay();
        startReviewsAutoPlay();
        return () => {
          stopHeroAutoPlay();
          stopReviewsAutoPlay();
        };
    }, [cityName, user?.id])
  );

  const fetchCollectionsData = async () => {
    try {
      const res = await getCollections();
      if (res?.collections && res.collections.length > 0) {
        setCollections(res.collections);
      }
    } catch (err) {
      console.warn("Failed to fetch collections", err);
    }
  };

  const fetchHeroBanners = async () => {
    try {
      getSliders('HOME').then(res => {
        if (res?.sliders && res.sliders.length > 0) {
          const formattedSliders = res.sliders.map(s => ({
              id: s.id,
              title: s.title,
              subtitle: s.subtitle,
              image: s.imageUrl,
              link: s.link,
              isAccent: true
          }));
          setHeroBanners(formattedSliders);
          setStorageItem('cached_hero_banners', formattedSliders);
        } else {
          // If empty array from server, keep default/cache
          loadCachedBanners();
        }
      }).catch((err) => {
        console.warn("API Slider fetch failed, loading cache", err);
        loadCachedBanners();
      });
    } catch (err) {
      loadCachedBanners();
    }
  };

  const loadCachedBanners = async () => {
    const cached = await getStorageItem<any[]>('cached_hero_banners', []);
    if (cached.length > 0) {
      setHeroBanners(cached);
    } else {
      setHeroBanners(FALLBACK_HERO_BANNERS);
    }
  };

  const handleSliderPress = (item: any) => {
    if (!item.link) return;

    if (item.link.startsWith('http')) {
        Linking.openURL(item.link);
    } else {
        // Internal navigation
        const path = item.link.startsWith('/') ? item.link.substring(1) : item.link;
        if (path === 'BuyCar') {
            navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'BuyCar' } } as any);
        } else if (path === 'SellCar') {
            navigation.navigate('SellCarNew');
        } else if (path === 'Profile') {
            navigation.navigate('Profile');
        } else {
            // Generic navigation for other screens if they exist in RootStackParamList
            try {
                navigation.navigate(path as any);
            } catch (e) {
                console.warn("Failed to navigate to", path, e);
            }
        }
    }
  };

  const startHeroAutoPlay = () => {
    stopHeroAutoPlay();
    if (!heroBanners || heroBanners.length <= 1) return;

    heroTimerRef.current = setInterval(() => {
      setActiveHero((prev) => {
        const len = heroBanners?.length || 0;
        if (len <= 1) return 0;
        const next = (prev + 1) % len;
        try {
          if (heroFlatListRef.current) {
            heroFlatListRef.current.scrollToIndex({ index: next, animated: true });
          }
        } catch (e) {
          console.warn("Hero auto-play scroll failed", e);
        }
        return next;
      });
    }, 5000);
  };

  const stopHeroAutoPlay = () => {
    if (heroTimerRef.current) {
      clearInterval(heroTimerRef.current);
      heroTimerRef.current = null;
    }
  };

  const startReviewsAutoPlay = () => {
    stopReviewsAutoPlay();
    if (!REVIEWS || REVIEWS.length <= 1) return;

    reviewTimerRef.current = setInterval(() => {
      setActiveReview((prev) => {
        const len = REVIEWS?.length || 0;
        if (len <= 1) return 0;
        const next = (prev + 1) % len;
        try {
          if (reviewsFlatListRef.current) {
            reviewsFlatListRef.current.scrollToIndex({ index: next, animated: true });
          }
        } catch (e) {
          console.warn("Reviews auto-play scroll failed", e);
        }
        return next;
      });
    }, 6000);
  };

  const stopReviewsAutoPlay = () => {
    if (reviewTimerRef.current) {
      clearInterval(reviewTimerRef.current);
      reviewTimerRef.current = null;
    }
  };

  const fetchFavorites = async () => {
    try {
      if (user?.id) {
        const res = await getFavorites(user.id);
        setFavorites(res.favorites.map((f: any) => f.id || (f as any).listingId));
      } else {
        const ids = await getStorageItem<string[]>('guest_favorites', []);
        setFavorites(ids);
      }
    } catch (err) {
      console.warn("Failed to fetch favorites", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await getBrands();
      if (res?.brands) {
        setBrands(res.brands);
      }
    } catch (err) {
      console.warn("Failed to fetch brands", err);
    }
  };

  const handleToggleFavorite = async (listingId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isFav = favorites.includes(listingId);
      // Optimistic update
      setFavorites(prev =>
        isFav ? prev.filter(id => id !== listingId) : [...prev, listingId]
      );

      if (user?.id) {
        await toggleFavorite(user.id, listingId);
      } else {
        // Handle guest favorites
        let ids = await getStorageItem<string[]>('guest_favorites', []);
        if (isFav) {
          ids = ids.filter((id: string) => id !== listingId);
        } else {
          ids.push(listingId);
        }
        await setStorageItem('guest_favorites', ids);
      }
    } catch (err) {
      console.warn("Failed to toggle favorite", err);
      // Rollback on error if user is logged in (API failed)
      if (user?.id) {
        const isFav = favorites.includes(listingId);
        setFavorites(prev =>
          !isFav ? prev.filter(id => id !== listingId) : [...prev, listingId]
        );
      }
    }
  };

  const loadCachedListings = async () => {
    const cached = await getStorageItem<any[]>('cached_featured_listings', []);
    if (cached.length > 0) {
      setFeaturedCars(cached);
      setLoading(false);
      return true;
    }
    return false;
  };

  const fetchFeaturedCars = async () => {
    setLoading(true);

    try {
      getListings({ status: 'ACTIVE', city: cityName || undefined }).then(res => {
          const activeListings = res?.listings || [];
          if (activeListings.length > 0) {
            setFeaturedCars(activeListings.slice(0, 10));
            setStorageItem('cached_featured_listings', activeListings.slice(0, 10));
          } else {
              loadCachedListings().then(cached => {
                if (!cached) setFeaturedCars(SEED_DATA);
              });
          }
      }).catch((err) => {
          console.warn("Fetch featured cars API failed", err);
          loadCachedListings().then(cached => {
            if (!cached) setFeaturedCars(SEED_DATA);
          });
      });
    } catch (err) {
        loadCachedListings().then(cached => {
          if (!cached) setFeaturedCars(SEED_DATA);
        });
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
    <ScreenWrapper scrollable withTabBar>
      <StatusBar style="dark" />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={COLORS.white} />
          <Text style={styles.offlineText}>You are currently offline. Showing cached results.</Text>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, {
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16)
      }]}>
        <Logo height={38} width={150} />
        <View style={styles.headerRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-outline" size={16} color={COLORS.black2} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{cityName || 'Select City'}</Text>
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

      {/* Hero Banner Carousel */}
      <View style={styles.heroSection}>
        <FlatList
          ref={heroFlatListRef}
          data={heroBanners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={(info) => {
            console.warn("Hero scroll to index failed", info);
            heroFlatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.round(x / (SCREEN_W - 30));
            if (idx !== activeHero) setActiveHero(idx);
          }}
          onScrollBeginDrag={stopHeroAutoPlay}
          onScrollEndDrag={startHeroAutoPlay}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable style={{ width: SCREEN_W - 30 }} onPress={() => handleSliderPress(item)}>
              <Image
                source={{ uri: item.image }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {item.title || "Feature Your Listing And Sell Faster!"}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {item.subtitle || "FEATURE MY LISTING"} {">"}
                </Text>
              </View>
            </Pressable>
          )}
        />
        <View style={styles.heroPagination}>
          {heroBanners.map((_, i) => (
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
              <Image source={{ uri: item.image }} style={styles.serviceImage} resizeMode="cover" />
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
          data={collections}
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
              <Image source={{ uri: item.imageUrl }} style={styles.collectionImage} resizeMode="cover" />
              <View style={styles.collectionOverlay}>
                <Text style={styles.collectionName}>{item.name}</Text>
              </View>
            </Pressable>
          )}
        />
        <View style={styles.paginationDots}>
          {collections.map((_, i) => (
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
                <Image source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1626244795368-f9478f772712?auto=format&fit=crop&w=600&q=80" }} style={styles.carImage} resizeMode="cover" />
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
                  <Text style={styles.carPrice}>₹{(item.demandPrice || 0).toLocaleString('en-IN')}</Text>
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
          {(showAllBrands ? brands : brands.slice(0, 9)).map(brand => (
            <Pressable key={brand.id} style={styles.brandItem} onPress={() => navigation.navigate('BrandDetails', { brand })}>
              <Image source={typeof brand.logo === 'string' ? { uri: brand.logo } : brand.logo} style={styles.brandLogo} resizeMode="contain" />
              <Text style={styles.brandName}>{brand.name}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={styles.viewAllBrandsBtn}
          onPress={() => setShowAllBrands(!showAllBrands)}
        >
          <Text style={styles.viewAllBrandsText}>{showAllBrands ? "VIEW LESS" : "VIEW ALL BRANDS"}</Text>
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
          onScrollToIndexFailed={(info) => {
            console.warn("Reviews scroll to index failed", info);
          }}
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
            resizeMode="cover"
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
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
  iconBtn: {
    padding: 4,
  },
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

  scrollContent: { paddingBottom: TAB_BAR_HEIGHT + 20 },

  searchSection: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey1,
    ...getShadow(0, 2, 0.05, 5, "#000", 2),
  },
  searchInputWrapper: { flex: 1, flexDirection: "row", alignItems: "center" },
  searchPlaceholderBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  searchPlaceholderText: { fontSize: 15, color: COLORS.textMuted, fontFamily: FONTS.openSans.regular },
  placeholderHighlight: { color: COLORS.secondary, fontSize: 15, fontFamily: FONTS.poppins.bold },

  heroSection: { marginHorizontal: 15, height: 180, borderRadius: 12, overflow: "hidden", marginBottom: 10 },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
    paddingRight: 40
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
    width: SCREEN_W * 0.7,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    ...getShadow(0, 1, 0.1, 2, "#000", 2),
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
    width: SCREEN_W * 0.7,
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
    paddingHorizontal: 15,
    justifyContent: "space-between"
  },
  brandItem: {
    width: (SCREEN_W - 50) / 3,
    backgroundColor: COLORS.lightBlue1,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  brandLogo: { width: 50, height: 32 },
  brandName: { fontSize: 13, color: COLORS.black2, marginTop: 5, textAlign: "center", fontFamily: FONTS.poppins.bold },
  viewAllBrandsBtn: {
    marginHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15
  },
  viewAllBrandsText: { color: COLORS.secondary, fontFamily: FONTS.poppins.bold, fontSize: 14 },

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
  offlineBanner: {
    backgroundColor: COLORS.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  offlineText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.poppins.semiBold,
  },
});
