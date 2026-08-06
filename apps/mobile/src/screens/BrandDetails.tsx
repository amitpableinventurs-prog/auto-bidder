import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getListings, ApiListing } from '../api';
import { getMockListings } from '../utils/mockData';
import { COLORS, FONTS, getShadow } from '../theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W } = Dimensions.get('window');

export default function BrandDetails() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'BrandDetails'>>();
  const { brand } = route.params;

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandListings();
  }, [brand.name]);

  const fetchBrandListings = async () => {
    setLoading(true);
    try {
      const res = await getListings({ brand: brand.name, status: 'ACTIVE' });
      let results = res.listings || [];

      // Fallback to mock data
      const mockResults = getMockListings({ status: 'ACTIVE', brand: brand.name });
      if (results.length === 0) {
        results = mockResults;
      }

      setListings(results);
    } catch (err) {
      console.warn('Failed to fetch brand listings, using mock data', err);
      const mockResults = getMockListings({ status: 'ACTIVE', brand: brand.name });
      setListings(mockResults);
    } finally {
      setLoading(false);
    }
  };

  const renderCarCard = ({ item }: { item: ApiListing }) => (
    <Pressable
      style={styles.carCard}
      onPress={() => {
        Haptics.selectionAsync();
        navigation.navigate('CarDetails', { listingId: item.id });
      }}
    >
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }} style={styles.carImage} resizeMode="cover" />
      <View style={styles.carInfo}>
        <Text style={styles.carTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.carPrice}>₹{(item.demandPrice || 0).toLocaleString('en-IN')}</Text>
        <View style={styles.carMeta}>
          <Text style={styles.carMetaText}>{item.manufacturingYear} • {item.fuelType}</Text>
          <Text style={styles.carMetaText}>{item.city}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>{brand.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.brandHero}>
          <View style={styles.logoContainer}>
            <Image
              source={typeof brand.logo === 'string' ? { uri: brand.logo } : brand.logo}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>{brand.name}</Text>
          <Text style={styles.brandCount}>{brand.count} Available</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>About {brand.name}</Text>
            <Text style={styles.descriptionText}>
              {brand.description || `Experience the legacy of ${brand.name}. Known for reliability, performance, and cutting-edge technology, ${brand.name} has been a leader in the automotive industry for decades.`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Listings</Text>
            {listings.length > 0 && (
              <Pressable onPress={() => navigation.navigate('BuyCar', { filters: { brand: brand.name } })}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 20 }} />
          ) : listings.length > 0 ? (
            <FlatList
              data={listings}
              renderItem={renderCarCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={64} color={COLORS.lightGrey1} />
              <Text style={styles.emptyText}>No active listings for {brand.name} at the moment.</Text>
              <Pressable
                style={styles.browseBtn}
                onPress={() => navigation.navigate('BuyCar', { filters: {} })}
              >
                <Text style={styles.browseBtnText}>Browse Other Brands</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  brandHero: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow(0, 2, 0.1, 4, "#000", 4),
    marginBottom: 15,
  },
  brandLogo: { width: 60, height: 60 },
  brandName: { fontSize: 24, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  brandCount: { fontSize: 14, color: COLORS.secondary, fontFamily: FONTS.poppins.semiBold, marginTop: 4 },
  descriptionBox: {
    marginTop: 25,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionTitle: { fontSize: 16, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, fontFamily: FONTS.openSans.regular },
  section: { paddingHorizontal: 15, marginTop: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  viewAll: { color: COLORS.coral, fontSize: 14, fontFamily: FONTS.poppins.bold },
  listContainer: { paddingBottom: 20 },
  carCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...getShadow(0, 1, 0.05, 2, "#000", 2),
  },
  carImage: { width: 120, height: 100 },
  carInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  carTitle: { fontSize: 15, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  carPrice: { fontSize: 16, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, marginTop: 2 },
  carMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  carMetaText: { fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.openSans.regular },
  emptyState: { alignItems: 'center', marginTop: 40, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', fontSize: 15, color: COLORS.textMuted, marginTop: 15, lineHeight: 22 },
  browseBtn: {
    marginTop: 25,
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  browseBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 14 },
});
