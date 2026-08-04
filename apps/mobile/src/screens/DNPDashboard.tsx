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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

const { width: SCREEN_W } = Dimensions.get('window');

export default function DNPDashboardScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const data = await request<any>('/api/dnp/dashboard');
      setStats(data);
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
        <Text style={styles.greeting}>Welcome to DNP</Text>
        <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
        <View style={styles.partnerIdRow}>
          <Text style={styles.partnerId}>Partner ID: {stats?.profileId?.substring(0, 8).toUpperCase() || '---'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: stats?.status === 'ACTIVE' ? COLORS.green + '20' : COLORS.yellow + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: stats?.status === 'ACTIVE' ? COLORS.green : COLORS.yellow }]} />
            <Text style={[styles.statusText, { color: stats?.status === 'ACTIVE' ? COLORS.green : COLORS.yellow }]}>{stats?.status || 'ACTIVE'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.black2} />
        </Pressable>
      </View>
    </View>
  );

  const renderFinancialSummary = () => (
    <View style={styles.financialSection}>
      <View style={styles.membershipBanner}>
        <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.secondary} />
        <Text style={styles.membershipText}>Plan: Pay After You Earn</Text>
      </View>

      <View style={styles.earningsGrid}>
        <FinancialCard
          label="Total Earnings"
          value={`₹${(stats?.financials?.totalEarnings || 0).toLocaleString('en-IN')}`}
          icon="wallet-outline"
          color={COLORS.black2}
        />
        <FinancialCard
          label="Pending"
          value={`₹${(stats?.financials?.pendingEarnings || 0).toLocaleString('en-IN')}`}
          icon="time-outline"
          color={COLORS.accent}
        />
        <FinancialCard
          label="Approved"
          value={`₹${(stats?.financials?.approvedEarnings || 0).toLocaleString('en-IN')}`}
          icon="checkmark-done-outline"
          color={COLORS.green}
        />
      </View>

      <View style={styles.recoveryCard}>
        <View style={styles.recoveryRow}>
          <View style={styles.recoveryItem}>
            <Text style={styles.recoveryLabel}>Fee Recovered</Text>
            <Text style={styles.recoveryValue}>₹{(stats?.financials?.recoveredFee || 0).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.recoveryDivider} />
          <View style={styles.recoveryItem}>
            <Text style={styles.recoveryLabel}>Remaining Fee</Text>
            <Text style={styles.recoveryValue}>₹{(stats?.financials?.remainingFee || 5000).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
            <Text style={styles.balanceValue}>₹{(stats?.financials?.availableBalance || 0).toLocaleString('en-IN')}</Text>
          </View>
          <Pressable style={styles.withdrawBtn} onPress={() => navigation.navigate('DNPWithdraw')}>
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activity Summary</Text>
      <View style={styles.statsContainer}>
        <StatCard
          icon="car-outline"
          label="Vehicle Leads"
          value={stats?.activity?.vehicleLeadsSubmitted || 0}
          color="#8b5cf6"
        />
        <StatCard
          icon="share-social-outline"
          label="Listings Shared"
          value={stats?.activity?.listingsShared || 0}
          color="#f59e0b"
        />
        <StatCard
          icon="person-outline"
          label="Buyer Leads"
          value={stats?.activity?.buyerLeads || 0}
          color={COLORS.secondary}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Conversions"
          value={stats?.activity?.conversions || 0}
          color={COLORS.green}
        />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Primary Actions</Text>
      <View style={styles.actionGrid}>
        <QuickAction
          icon="car-sport-outline"
          label="Bring a Car"
          color={COLORS.secondary}
          onPress={() => navigation.navigate('DNPVehicleAcquisition')}
        />
        <QuickAction
          icon="search-outline"
          label="Browse & Share"
          color={COLORS.primary}
          onPress={() => navigation.navigate('DNPShareListing')}
        />
        <QuickAction
          icon="list-outline"
          label="My Shared"
          color="#f59e0b"
          onPress={() => navigation.navigate('DNPListings')}
        />
        <QuickAction
          icon="people-circle-outline"
          label="My Leads"
          color={COLORS.green}
          onPress={() => navigation.navigate('DNPLeads')}
        />
        <QuickAction
          icon="wallet-outline"
          label="Wallet"
          color={COLORS.accent}
          onPress={() => navigation.navigate('DNPWallet')}
        />
        <QuickAction
          icon="document-text-outline"
          label="Agreement"
          color={COLORS.grey}
          onPress={() => navigation.navigate('DNPActivation')}
        />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
      >
        {stats?.isSuspicious && (
          <View style={styles.suspiciousBanner}>
            <Ionicons name="warning" size={20} color={COLORS.coral} />
            <Text style={styles.suspiciousText}>Account under review due to high activity.</Text>
          </View>
        )}
        {renderFinancialSummary()}
        {renderStatsCards()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
}

function FinancialCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <View style={styles.financialCard}>
      <Ionicons name={icon} size={20} color={color} style={{ marginBottom: 4 }} />
      <Text style={styles.financialLabel}>{label}</Text>
      <Text style={[styles.financialValue, { color }]}>{value}</Text>
    </View>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: any, 
  label: string, 
  value: string | number, 
  color: string
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  greeting: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  userName: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    fontSize: 20,
  },
  partnerIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  partnerId: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.grey,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.poppins.bold,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
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
  suspiciousBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  suspiciousText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#991B1B',
    fontFamily: FONTS.poppins.bold,
    fontSize: 11,
  },
  financialSection: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  membershipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 20,
  },
  membershipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.bold,
    fontSize: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  financialCard: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  financialValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    fontSize: 16,
  },
  recoveryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  recoveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  recoveryItem: {
    flex: 1,
    alignItems: 'center',
  },
  recoveryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.lightGrey1,
  },
  recoveryLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  recoveryValue: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.bold,
  },
  balanceValue: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
  },
  withdrawBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  withdrawBtnText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 16,
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: (SCREEN_W - 56) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    fontSize: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAction: {
    width: (SCREEN_W - 56) / 3,
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quickActionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
    fontSize: 11,
  },
});
