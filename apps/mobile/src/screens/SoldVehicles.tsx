import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DARK = '#0f172a';
const LIGHT = '#f8fafc';
const ACCENT = '#3b82f6';
const SUCCESS = '#22c55e';
const MUTED = '#64748b';

import { ApiListing, getListings } from '../api';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function SoldVehicles() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sold, setSold] = React.useState<ApiListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      const res = await getListings({ status: 'SOLD' });
      setSold(res.listings);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <View>
            <Text style={styles.headerTitle}>Sold Vehicles</Text>
            <Text style={styles.headerSub}>Historical records of your sales</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Fetching your sales history...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
          }
        >
          {sold.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="car-outline" size={48} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>No Sales Yet</Text>
              <Text style={styles.emptySub}>Your successfully sold vehicles will appear here.</Text>
              <Pressable style={styles.startSellingBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.startSellingText}>Start Selling</Text>
              </Pressable>
            </View>
          ) : (
            sold.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80' }}
                      style={styles.img}
                    />
                    <View style={styles.soldBadge}>
                        <Text style={styles.soldBadgeText}>SOLD</Text>
                    </View>
                </View>

                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.year}>{item.manufacturingYear || '2022'}</Text>
                  </View>

                  <View style={styles.specRow}>
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="gas-station" size={14} color={MUTED} />
                        <Text style={styles.specText}>{item.fuelType || 'Petrol'}</Text>
                    </View>
                    <View style={styles.specDivider} />
                    <View style={styles.specItem}>
                        <MaterialCommunityIcons name="speedometer" size={14} color={MUTED} />
                        <Text style={styles.specText}>{(item.kilometersDriven || 12000).toLocaleString()} km</Text>
                    </View>
                    <View style={styles.specDivider} />
                    <View style={styles.specItem}>
                        <Ionicons name="location-outline" size={14} color={MUTED} />
                        <Text style={styles.specText}>{item.city || 'Indore'}</Text>
                    </View>
                  </View>

                  <View style={styles.buyerBox}>
                      <View style={styles.buyerAvatar}>
                          <Text style={styles.avatarText}>{(item.bids?.[0]?.user?.name?.[0] || 'B').toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                          <Text style={styles.buyerLabel}>Sold to</Text>
                          <Text style={styles.buyerName}>{item.bids?.[0]?.user?.name || 'Verified Buyer'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.salePriceLabel}>Sale Price</Text>
                          <Text style={styles.salePrice}><Text style={{ fontFamily: undefined }}>₹</Text> {(item.bids?.[0]?.amount || item.demandPrice || 0).toLocaleString()}</Text>
                      </View>
                  </View>

                  <View style={styles.actionRow}>
                      <Pressable style={[styles.actionBtn, styles.invoiceBtn]}>
                          <Ionicons name="document-text-outline" size={18} color={DARK} />
                          <Text style={styles.actionBtnText}>Invoice</Text>
                      </Pressable>
                      <View style={{ width: 12 }} />
                      <Pressable style={[styles.actionBtn, styles.detailsBtn]}>
                          <Text style={styles.actionBtnText}>View Details</Text>
                          <Ionicons name="chevron-forward" size={18} color={DARK} />
                      </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: MUTED, fontSize: 14, fontWeight: '500' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: DARK, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: MUTED, marginTop: 1 },
  content: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.05)' },
      default: {
        shadowColor: DARK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      }
    }),
    elevation: 4
  },
  imageContainer: { position: 'relative' },
  img: { width: '100%', height: 180 },
  soldBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  soldBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  info: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: DARK, flex: 1 },
  year: { fontSize: 14, fontWeight: '600', color: ACCENT, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },

  specRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specText: { fontSize: 12, color: MUTED, fontWeight: '500' },
  specDivider: { width: 1, height: 12, backgroundColor: '#e2e8f0', marginHorizontal: 12 },

  buyerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: '#f1f5f9'
  },
  buyerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: DARK },
  buyerLabel: { fontSize: 12, color: MUTED, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  buyerName: { fontSize: 14, fontWeight: '700', color: DARK },
  salePriceLabel: { fontSize: 12, color: MUTED, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5, textAlign: 'right' },
  salePrice: { fontSize: 16, fontWeight: '900', color: SUCCESS, textAlign: 'right' },

  actionRow: { flexDirection: 'row', marginTop: 20 },
  actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6
  },
  invoiceBtn: { backgroundColor: '#f1f5f9' },
  detailsBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: DARK },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: DARK, marginBottom: 8 },
  emptySub: { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 20 },
  startSellingBtn: { marginTop: 24, backgroundColor: DARK, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 5 },
  startSellingText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
