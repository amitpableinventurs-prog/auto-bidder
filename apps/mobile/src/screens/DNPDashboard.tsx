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
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT, getShadow } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

const { width: SCREEN_W } = Dimensions.get('window');

export default function DNPDashboardScreen({ navigation }: any) {
  const { user, token } = useAuth();
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
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainDrawer')}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
          </Pressable>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
          </View>
        </View>
        <Pressable style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.black2} />
          <View style={styles.notificationBadge} />
        </Pressable>
      </View>

      <View style={styles.partnerInfoRow}>
        <View style={styles.idContainer}>
          <Text style={styles.partnerIdLabel}>PARTNER ID</Text>
          <Text style={styles.partnerIdValue}>{stats?.profileId?.substring(0, 8).toUpperCase() || '---'}</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <View style={[styles.statusBadge, { backgroundColor: stats?.status === 'ACTIVE' ? '#DCFCE7' : '#FEF9C3' }]}>
            <View style={[styles.statusDot, { backgroundColor: stats?.status === 'ACTIVE' ? COLORS.green : COLORS.yellow }]} />
            <Text style={[styles.statusText, { color: stats?.status === 'ACTIVE' ? '#166534' : '#854d0e' }]}>{stats?.status || 'ACTIVE'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFinancialSummary = () => (
    <View style={styles.financialSection}>
      <View style={styles.balanceHeader}>
        <View>
          <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
          <Text style={styles.balanceValue}>₹{(stats?.financials?.availableBalance || 0).toLocaleString('en-IN')}</Text>
        </View>
        <Pressable style={styles.withdrawBtn} onPress={() => navigation.navigate('DNPWithdraw')}>
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
        </Pressable>
      </View>

      <View style={styles.earningsRow}>
        <View style={styles.earningItem}>
          <Text style={styles.earningLabel}>Total Earned</Text>
          <Text style={styles.earningValue}>₹{(stats?.financials?.totalEarnings || 0).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.hDivider} />
        <View style={styles.earningItem}>
          <Text style={styles.earningLabel}>Pending</Text>
          <Text style={styles.earningValue}>₹{(stats?.financials?.pendingEarnings || 0).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.hDivider} />
        <View style={styles.earningItem}>
          <Text style={styles.earningLabel}>Approved</Text>
          <Text style={styles.earningValue}>₹{(stats?.financials?.approvedEarnings || 0).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.membershipRecovery}>
        <View style={styles.recoveryInfo}>
          <View style={styles.recoveryTextRow}>
            <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.secondary} />
            <Text style={styles.recoveryTitle}>Membership Recovery Plan</Text>
          </View>
          <Text style={styles.recoveryProgressText}>
            ₹{(stats?.financials?.recoveredFee || 0).toLocaleString('en-IN')} / ₹{(stats?.financials?.totalFee || 5000).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((stats?.financials?.recoveredFee || 0) / 5000) * 100}%` }]} />
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
      <View style={[styles.statIconContainer, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
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
      <View style={[styles.quickActionIcon, { backgroundColor: COLORS.white, borderColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...getShadow(0, 10, 0.05, 20, "#000", 5),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.medium,
  },
  userName: {
    fontSize: 22,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginTop: -2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coral,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  partnerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
  },
  idContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  partnerIdLabel: {
    fontSize: 9,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  partnerIdValue: {
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  vDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statusContainer: {
    flex: 1.2,
  },
  statusLabel: {
    fontSize: 9,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
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
    fontSize: 11,
    color: '#991B1B',
    fontFamily: FONTS.poppins.bold,
  },
  financialSection: {
    backgroundColor: COLORS.secondary,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    ...getShadow(0, 8, 0.2, 16, COLORS.secondary, 8),
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.poppins.medium,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  withdrawBtnText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  earningsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  earningItem: {
    flex: 1,
    alignItems: 'center',
  },
  hDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  earningLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FONTS.poppins.medium,
    marginBottom: 2,
  },
  earningValue: {
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  membershipRecovery: {
    gap: 10,
  },
  recoveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveryTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recoveryTitle: {
    fontSize: 11,
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  recoveryProgressText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.poppins.bold,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (SCREEN_W - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    margin: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...getShadow(0, 2, 0.03, 8, "#000", 2),
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.medium,
    marginTop: -2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 10,
    ...getShadow(0, 4, 0.03, 12, "#000", 2),
  },
  quickAction: {
    width: (SCREEN_W - 56) / 3,
    alignItems: 'center',
    marginVertical: 14,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  quickActionLabel: {
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
  },
});
