import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');

export default function DNPDashboardScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REFERRALS' | 'LISTINGS' | 'LEADS'>('DASHBOARD');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Dashboard Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.black2} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={24} color={COLORS.black2} />
        </Pressable>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <StatCard
        icon="wallet-outline"
        label="Total Earnings"
        value={`₹${(stats?.stats?.totalEarnings || 0).toLocaleString()}`}
        color={COLORS.success}
        trend="+12%"
      />
      <StatCard
        icon="hourglass-outline"
        label="Pending Earnings"
        value={`₹${(stats?.stats?.pendingEarnings || 0).toLocaleString()}`}
        color={COLORS.accent}
      />
      <StatCard
        icon="cash-outline"
        label="Available Balance"
        value={`₹${(stats?.stats?.availableBalance || 0).toLocaleString()}`}
        color={COLORS.secondary}
      />
      <StatCard
        icon="people-outline"
        label="Total Referrals"
        value={stats?.stats?.totalReferrals || 0}
        color={COLORS.primary}
      />
      <StatCard
        icon="car-outline"
        label="Active Listings"
        value={stats?.stats?.activeListings || 0}
        color="#8b5cf6"
      />
      <StatCard
        icon="share-social-outline"
        label="Shared Listings"
        value={stats?.stats?.sharedListingsCount || 0}
        color="#f59e0b"
      />
      <StatCard
        icon="checkmark-circle-outline"
        label="Sold Vehicles"
        value={stats?.stats?.soldVehicles || 0}
        color={COLORS.coral}
      />
      <StatCard
        icon="trending-up-outline"
        label="Conversion Rate"
        value={`${stats?.stats?.conversionRate || 0}%`}
        color="#10b981"
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <QuickAction
          icon="person-add-outline"
          label="Bring New Listing"
          color={COLORS.secondary}
          onPress={() => navigation.navigate('DNPReferral')}
        />
        <QuickAction
          icon="share-outline"
          label="Share Existing Cars"
          color={COLORS.primary}
          onPress={() => navigation.navigate('DNPShareListing')}
        />
        <QuickAction
          icon="list-outline"
          label="My Leads"
          color={COLORS.success}
          onPress={() => setActiveTab('LEADS')}
        />
        <QuickAction
          icon="wallet-outline"
          label="Wallet"
          color={COLORS.accent}
          onPress={() => navigation.navigate('DNPWallet')}
        />
        <QuickAction
          icon="arrow-down-circle-outline"
          label="Withdraw Earnings"
          color={COLORS.coral}
          onPress={() => navigation.navigate('DNPWithdraw')}
        />
        <QuickAction
          icon="stats-chart-outline"
          label="My Listings"
          color="#8b5cf6"
          onPress={() => setActiveTab('LISTINGS')}
        />
      </View>
    </View>
  );

  const renderRecentActivity = () => {
    const activities: any[] = [];

    if (stats?.recentActivity?.referrals) {
      stats.recentActivity.referrals.forEach((item: any) => {
        activities.push({
          icon: 'person-add',
          title: 'New Referral',
          description: item.referredUser?.name || 'New user registered',
          time: new Date(item.createdAt).toLocaleDateString(),
          color: COLORS.secondary,
          rawDate: new Date(item.createdAt)
        });
      });
    }

    if (stats?.recentActivity?.leads) {
      stats.recentActivity.leads.forEach((item: any) => {
        activities.push({
          icon: 'list',
          title: 'New Buyer Lead',
          description: `${item.buyerName} for ${item.sharedListing?.listing?.title}`,
          time: new Date(item.createdAt).toLocaleDateString(),
          color: COLORS.success,
          rawDate: new Date(item.createdAt)
        });
      });
    }

    // Sort combined activities by date descending
    activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activities.length > 0 ? (
          activities.slice(0, 5).map((item, index) => (
            <ActivityItem
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              time={item.time}
              color={item.color}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={40} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
      </View>
    );
  };

  const renderReferralCodeCard = () => (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <MaterialCommunityIcons name="qrcode" size={32} color={COLORS.secondary} />
        <View style={styles.referralTitle}>
          <Text style={styles.referralMainTitle}>Your Referral Code</Text>
          <Text style={styles.referralSubtitle}>Share and earn commissions</Text>
        </View>
      </View>
      <View style={styles.referralCodeBox}>
        <Text style={styles.referralCode}>AB-DNP-1234</Text>
        <Pressable style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={18} color={COLORS.white} />
        </Pressable>
      </View>
      <View style={styles.shareButtons}>
        <ShareButton icon="logo-whatsapp" label="WhatsApp" color="#25D366" />
        <ShareButton icon="logo-facebook" label="Facebook" color="#1877F2" />
        <ShareButton icon="send" label="Telegram" color="#0088cc" />
        <ShareButton icon="logo-facebook-messenger" label="SMS" color="#0084FF" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {renderHeader()}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderReferralCodeCard()}
        {renderStatsCards()}
        {renderQuickActions()}
        {renderRecentActivity()}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, trend }: { 
  icon: any, 
  label: string, 
  value: string | number, 
  color: string,
  trend?: string 
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {trend && (
        <View style={styles.trendBadge}>
          <Ionicons name="trending-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: { 
  icon: any, 
  label: string, 
  color: string, 
  onPress: () => void 
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function ActivityItem({ icon, title, description, time, color }: {
  icon: any,
  title: string,
  description: string,
  time: string,
  color: string
}) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDesc}>{description}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

function ShareButton({ icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <Pressable style={[styles.shareButton, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.shareButtonLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  greeting: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  userName: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  referralCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    marginLeft: 12,
    flex: 1,
  },
  referralMainTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  referralSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  referralCode: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    letterSpacing: 2,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    gap: 6,
  },
  shareButtonLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: (SCREEN_W - 56) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  trendText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAction: {
    width: (SCREEN_W - 56) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    marginBottom: 12,
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 2,
  },
  activityDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  activityTime: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.grey,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 12,
  },
});
