import { FONTS } from '../theme';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { getSellerStats, getSellerActivity } from '../api';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

const COLORS = {
  bg: "#F0F2F5",
  white: "#FFFFFF",
  primary: "#0056b3",
  secondary: "#6c757d",
  text: "#212529",
  textLight: "#6c757d",
  accent: "#f39c12",
  border: "#dee2e6",
  blue: "#0066CC",
  lightBlue: "#E7F1FF",
  red: "#ff4d4d",
  green: "#28a745",
};

export default function SellerDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.id || 'demo-seller';
  const isDealer = user?.userType === 'DEALER';

  const onNavigate = (screen: string) => {
      const routeMap: any = {
          'chooseCarType': 'FillDetails',
          'earnings': 'Earnings',
          'listings': 'ListingManagement',
          'listingManagement': 'ListingManagement',
          'activeAuctions': 'ListingManagement',
          'sold': 'SoldVehicles',
          'soldVehicles': 'SoldVehicles',
          'rtoNoc': 'RtoNocModule',
          'kyc': 'Kyc',
      };
      if (routeMap[screen]) {
          navigation.navigate(routeMap[screen] as any);
      }
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetching independently for better perceived performance
      getSellerStats(userId).then(res => setStatsData(res)).catch(e => console.warn(e));
      getSellerActivity(userId).then(res => setActivities(res.activities)).catch(e => console.warn(e));

      // Wait a bit to ensure states update if they are fast
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.warn('Seller dashboard fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    loadData(true);
  };

  const stats = [
    { label: 'LIVE BIDS', value: statsData?.liveBids?.toString() || '0', color: COLORS.blue, icon: 'hammer-outline' },
    { label: 'ACTIVE', value: statsData?.activeListings?.toString() || '0', color: COLORS.accent, icon: 'car-outline' },
    { label: isDealer ? 'COMMISSION' : 'SOLD', value: isDealer ? `₹${(statsData?.totalEarnings * 0.05 || 0).toLocaleString()}` : statsData?.soldCars?.toString() || '0', color: COLORS.green, icon: isDealer ? 'wallet-outline' : 'checkmark-done-circle-outline' },
  ];

  if (loading && !statsData) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: COLORS.bg }]}>
            <ActivityIndicator color={COLORS.blue} size="large" />
            <Text style={{ marginTop: 15, color: COLORS.textLight, fontFamily: FONTS.poppins.medium }}>Loading Studio...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>{isDealer ? 'Dealer Studio' : 'Seller Studio'}</Text>
          <Text style={styles.subWelcome}>{isDealer ? user?.businessName || 'Your Showroom' : 'Your hub for vehicle auctions & sales'}</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => onNavigate('chooseCarType')}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />
        }
      >

        {/* Revenue Card */}
        <View style={styles.revenueCardContainer}>
            <View style={styles.revenueCard}>
                <View style={styles.revenueRow}>
                    <View>
                        <Text style={styles.revenueLabel}>{isDealer ? 'TOTAL SALES & COMMISSION' : 'TOTAL SALES REVENUE'}</Text>
                        <Text style={styles.revenueValue}><Text style={{ fontFamily: undefined }}>₹</Text>{statsData?.totalEarnings?.toLocaleString('en-IN') || '45,20,000'}</Text>
                    </View>
                    <View style={styles.revenueIconBox}>
                        <Ionicons name="bar-chart" size={32} color={COLORS.green} />
                    </View>
                </View>
                <View style={styles.revenueFooter}>
                    <View style={styles.growthBadge}>
                        <Ionicons name="trending-up" size={14} color={COLORS.green} />
                        <Text style={styles.growthText}>+12.5%</Text>
                    </View>
                    <Pressable style={styles.detailsBtn} onPress={() => onNavigate('earnings')}>
                        <Text style={styles.detailsText}>VIEW ANALYTICS</Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.accent} />
                    </Pressable>
                </View>
            </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.lightBlue }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{String(stat.value).startsWith('₹') ? <><Text style={{ fontFamily: undefined }}>₹</Text>{String(stat.value).slice(1)}</> : stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Dealer Exclusive Section */}
        {isDealer && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dealer Actions</Text>
                <View style={styles.dealerGrid}>
                    <Pressable style={styles.dealerAction} onPress={() => onNavigate('chooseCarType')}>
                        <MaterialCommunityIcons name="account-search" size={24} color={COLORS.blue} />
                        <Text style={styles.dealerActionText}>Sell for Owner</Text>
                    </Pressable>
                    <Pressable style={styles.dealerAction} onPress={() => onNavigate('earnings')}>
                        <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.green} />
                        <Text style={styles.dealerActionText}>Commission</Text>
                    </Pressable>
                </View>
            </View>
        )}

        {/* Recent Activity Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Bidding Activity</Text>
            {activities.length > 0 ? activities.map((activity, i) => (
                <View key={i} style={styles.activityItem}>
                    <View style={styles.activityAvatar}>
                        <Text style={styles.avatarText}>{(activity.user?.name?.[0] || 'U').toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.activityText}>
                            <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{activity.user?.name || 'Anonymous'}</Text>
                            <Text style={{ color: COLORS.textLight }}> bid on </Text>
                            <Text style={{ fontWeight: 'bold', color: COLORS.accent }}>{activity.listing?.title}</Text>
                        </Text>
                        <Text style={styles.activityTime}>{new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    </View>
                    <Text style={styles.activityAmount}><Text style={{ fontFamily: undefined }}>₹</Text>{activity.amount.toLocaleString()}</Text>
                </View>
            )) : (
                <Text style={{ textAlign: 'center', color: COLORS.textLight, marginTop: 10 }}>No recent bids on your cars.</Text>
            )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Inventory</Text>
            <Pressable onPress={() => onNavigate('listingManagement')}>
              <Text style={styles.viewAll}>SEE ALL {">"}</Text>
            </Pressable>
          </View>

          <View style={styles.menuGrid}>
              <Pressable style={styles.gridItem} onPress={() => onNavigate('activeAuctions')}>
                  <View style={[styles.gridIcon, { backgroundColor: COLORS.lightBlue }]}>
                      <MaterialCommunityIcons name="gavel" size={26} color={COLORS.blue} />
                  </View>
                  <Text style={styles.gridTitle}>Live Auctions</Text>
                  <Text style={styles.gridSub}>Bidding now</Text>
              </Pressable>

              <Pressable style={styles.gridItem} onPress={() => onNavigate('listingManagement')}>
                  <View style={[styles.gridIcon, { backgroundColor: '#fff7ed' }]}>
                      <Ionicons name="create-outline" size={26} color={COLORS.accent} />
                  </View>
                  <Text style={styles.gridTitle}>Manage Drafts</Text>
                  <Text style={styles.gridSub}>Edit listings</Text>
              </Pressable>

              <Pressable style={styles.gridItem} onPress={() => onNavigate('soldVehicles')}>
                  <View style={[styles.gridIcon, { backgroundColor: '#f0fdf4' }]}>
                      <Ionicons name="ribbon-outline" size={26} color={COLORS.green} />
                  </View>
                  <Text style={styles.gridTitle}>Sold Units</Text>
                  <Text style={styles.gridSub}>View reports</Text>
              </Pressable>

              <Pressable style={styles.gridItem} onPress={() => onNavigate('rtoNoc')}>
                  <View style={[styles.gridIcon, { backgroundColor: '#fef2f2' }]}>
                      <Ionicons name="document-text-outline" size={26} color={COLORS.red} />
                  </View>
                  <Text style={styles.gridTitle}>RTO & NOC</Text>
                  <Text style={styles.gridSub}>Paperwork</Text>
              </Pressable>
          </View>
        </View>

        {/* Verification Promo */}
        <View style={styles.verificationBanner}>
            <View style={styles.verificationIcon}>
               <MaterialCommunityIcons name="shield-check" size={28} color="#FFC307" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.promoTitle}>Verified Seller Program</Text>
                <Text style={styles.promoDesc}>Verified sellers get 40% higher bid conversion rates.</Text>
                <Pressable style={styles.applyBtn} onPress={() => onNavigate('kyc')}>
                    <Text style={styles.applyText}>APPLY NOW {">"}</Text>
                </Pressable>
            </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 100,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcome: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subWelcome: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  addBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  scrollContent: { backgroundColor: COLORS.bg },
  revenueCardContainer: { padding: 15 },
  revenueCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revenueLabel: { color: COLORS.textLight, fontSize: 12, fontWeight: 'bold' },
  revenueValue: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  revenueIconBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  revenueFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: COLORS.border },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  growthText: { color: COLORS.green, fontSize: 12, fontWeight: 'bold' },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsText: { color: COLORS.accent, fontSize: 12, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, alignItems: 'center', elevation: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 4, fontWeight: 'bold' },

  section: { paddingHorizontal: 15, marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  viewAll: { color: COLORS.accent, fontSize: 12, fontWeight: 'bold' },

  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  activityAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lightBlue, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { color: COLORS.blue, fontSize: 16, fontWeight: 'bold' },
  activityText: { fontSize: 14 },
  activityTime: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  activityAmount: { fontSize: 14, fontWeight: 'bold', color: COLORS.green },

  dealerGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  dealerAction: { flex: 1, backgroundColor: COLORS.white, padding: 15, borderRadius: 12, alignItems: 'center', gap: 8, elevation: 1 },
  dealerActionText: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: (SCREEN_W - 40) / 2, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, elevation: 1 },
  gridIcon: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  gridTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  gridSub: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },

  verificationBanner: {
    backgroundColor: '#1E293B',
    marginHorizontal: 15,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  verificationIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  promoTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  promoDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  applyBtn: { marginTop: 12 },
  applyText: { color: '#FFC307', fontSize: 14, fontWeight: 'bold' }
});
