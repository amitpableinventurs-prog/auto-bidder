import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import {
  getUserBids,
  getFavorites,
  getNotifications,
  type ApiListing,
} from '../api';
import { useAppStore } from '../store/useAppStore';
import Logo from '../components/Logo';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, FONTS, TAB_BAR_HEIGHT, getShadow } from '../theme';
import { getStorageItem } from '../utils/storage-utils';
import { getListing } from '../api';

const { width } = Dimensions.get('window');

type TabType = 'Bids Placed' | 'Won Auctions' | 'Lost Auctions' | 'Viewed Cars' | 'Saved Cars' | 'Notifications';

const TABS: TabType[] = [
  'Bids Placed',
  'Won Auctions',
  'Lost Auctions',
  'Viewed Cars',
  'Saved Cars',
  'Notifications',
];

const MOCK_BIDS = [
  {
    id: '1',
    amount: 850000,
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
    listing: {
      id: 'l1',
      title: '2022 Honda City ZX',
      imageUrl: 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=300&q=80',
    }
  },
  {
    id: '2',
    amount: 1200000,
    status: 'OUTBID',
    createdAt: new Date().toISOString(),
    listing: {
      id: 'l2',
      title: '2021 Hyundai Creta SX',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80',
    }
  },
  {
    id: '3',
    amount: 450000,
    status: 'WON',
    createdAt: new Date().toISOString(),
    listing: {
      id: 'l3',
      title: '2019 Maruti Swift VXI',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80',
    }
  },
  {
    id: '4',
    amount: 2500000,
    status: 'REJECTED',
    createdAt: new Date().toISOString(),
    listing: {
      id: 'l4',
      title: '2023 Toyota Fortuner',
      imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=300&q=80',
    }
  }
];

const MOCK_FAVORITES: ApiListing[] = [
  {
    id: 'f1',
    title: '2023 Mahindra Thar 4x4',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80',
    manufacturingYear: 2023,
    fuelType: 'Diesel',
    transmission: 'Manual',
    startingBid: 1400000,
    kilometersDriven: 5000,
    city: 'Mumbai',
    sellerId: 's1',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f2',
    title: '2022 Kia Seltos GTX',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80',
    manufacturingYear: 2022,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    startingBid: 1650000,
    kilometersDriven: 12000,
    city: 'Delhi',
    sellerId: 's2',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Outbid Alert!',
    message: 'Someone just placed a higher bid on 2021 Hyundai Creta.',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'n2',
    title: 'Auction Won!',
    message: 'Congratulations! You won the auction for 2019 Maruti Swift.',
    createdAt: new Date().toISOString(),
    read: true,
  },
  {
    id: 'n3',
    title: 'New Listing in Mumbai',
    message: 'A new Mahindra Thar just got listed in your city.',
    createdAt: new Date().toISOString(),
    read: true,
  }
];

export default function Activity({ navigation, route }: any) {
  const initialTab = route.params?.initialTab as TabType;

  const { user } = useAuth();
  const { recentlyViewed, selectedCity, setSelectedListing } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'Bids Placed');
  const [loading, setLoading] = useState(false);

  // Data states
  const [bids, setBids] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<ApiListing[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        // Real API call for logged in user
        const [bidsRes, favRes, notifRes] = await Promise.all([
          getUserBids(user.id).catch(err => {
              console.warn("Bids API failed", err);
              return { bids: MOCK_BIDS };
          }),
          getFavorites(user.id).catch(err => {
              console.warn("Favorites API failed", err);
              return { favorites: MOCK_FAVORITES };
          }),
          getNotifications(user.id).catch(err => {
              if (__DEV__) console.warn("Notifications API failed", err);
              return { notifications: MOCK_NOTIFICATIONS };
          }),
        ]);
        setBids(bidsRes.bids || []);
        setFavorites(favRes.favorites || []);
        setNotifications(notifRes.notifications || []);
      } else {
        // Guest mode - fetch only favorites from storage
        const ids = await getStorageItem<string[]>('guest_favorites', []);
        if (ids.length > 0) {
          // Fetch basic details for each favorite car
          const favListings = await Promise.all(
            ids.map(id => getListing(id).then(res => res.listing).catch(() => null))
          );
          setFavorites(favListings.filter(l => l !== null) as ApiListing[]);
        } else {
          setFavorites([]);
        }
        setBids([]);
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Failed to fetch activity data', err);
    } finally {
      setLoading(false);
    }
  };

  const wonAuctions = useMemo(() => bids.filter(b => b.status === 'ACCEPTED' || b.status === 'WON'), [bids]);
  const lostAuctions = useMemo(() => bids.filter(b => b.status === 'REJECTED' || b.status === 'OUTBID'), [bids]);

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Syncing activity...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'Bids Placed':
        return renderBidsList(bids);
      case 'Won Auctions':
        return renderBidsList(wonAuctions);
      case 'Lost Auctions':
        return renderBidsList(lostAuctions);
      case 'Viewed Cars':
        return renderCarsList(recentlyViewed);
      case 'Saved Cars':
        return renderCarsList(favorites);
      case 'Notifications':
        return renderNotificationsList();
      default:
        return null;
    }
  };

  const renderBidsList = (data: any[]) => (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => {
            if (item.listing) {
              setSelectedListing(item.listing);
              navigation.navigate('CarDetails', { listingId: item.listing.id });
            }
          }}
        >
          <Image
            source={{ uri: item.listing?.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=300&q=80' }}
            style={styles.cardImg}
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.listing?.title || 'Unknown Vehicle'}</Text>
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>BID AMOUNT</Text>
                <Text style={styles.amountText}>₹{(item.amount ?? 0).toLocaleString('en-IN')}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
               <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
               </View>
               <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState message={`No ${activeTab.toLowerCase()} found.`} />}
    />
  );

  const renderCarsList = (data: ApiListing[]) => (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => {
            setSelectedListing(item);
            navigation.navigate('CarDetails', { listingId: item.id });
          }}
        >
          <Image
            source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=300&q=80' }}
            style={styles.cardImg}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.manufacturingYear} · {item.fuelType} · {item.transmission}</Text>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>STARTING BID</Text>
                <Text style={styles.priceText}>₹{(item.startingBid ?? 0).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={<EmptyState message={`No ${activeTab.toLowerCase()} found.`} />}
    />
  );

  const renderNotificationsList = () => (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={[styles.notifCard, !item.read && styles.notifUnread]}>
           <View style={styles.notifIconBox}>
              <Ionicons name="notifications" size={20} color={COLORS.secondary} />
           </View>
           <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifMsg}>{item.message}</Text>
              <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
           </View>
        </View>
      )}
      ListEmptyComponent={<EmptyState message="No notifications found." />}
    />
  );

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':
      case 'WON':
        return '#22C55E';
      case 'REJECTED':
      case 'LOST':
        return '#EF4444';
      case 'OUTBID':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  return (
    <ScreenWrapper scrollable={false} withTabBar>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Logo height={38} width={150} />
        <View style={styles.headerRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-outline" size={16} color={COLORS.black2} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
          </Pressable>

          <Pressable style={styles.iconBtn} onPress={() => setActiveTab('Notifications')}>
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map(tab => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.container}>
        {renderTabContent()}
      </View>
    </ScreenWrapper>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="clipboard-text-search-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsScroll: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: FONTS.poppins.medium,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14, fontWeight: '600' },
  listContent: { padding: 15, paddingBottom: TAB_BAR_HEIGHT + 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...getShadow(0, 2, 0.05, 4, '#000', 2),
  },
  cardImg: { width: 90, height: 90, borderRadius: 12 },
  cardInfo: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 8 },
  amountBox: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 8, color: '#64748B', fontWeight: '800' },
  amountText: { fontSize: 14, fontWeight: '800', color: COLORS.secondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  dateText: { fontSize: 10, color: '#94A3B8' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  priceLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '700' },
  priceText: { fontSize: 14, fontWeight: '800', color: COLORS.secondary },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifUnread: { backgroundColor: '#F0F7FF', borderColor: '#BFDBFE' },
  notifIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  notifInfo: { flex: 1, marginLeft: 12 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  notifMsg: { fontSize: 12, color: '#64748B', marginTop: 4 },
  notifTime: { fontSize: 10, color: '#94A3B8', marginTop: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 15, color: '#94A3B8', fontWeight: '600' },
});
