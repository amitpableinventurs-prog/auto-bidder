import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { getSellerStats, getLeads, updateUser } from '../api';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT } from '../theme';
import Logo from '../components/Logo';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../AuthContext';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');

const MOCK_STATS = {
  activeListings: 3,
  totalEarnings: 45000,
  soldCars: 12
};

const MOCK_LEADS = [
  { id: 'm1', name: 'John Doe', listingTitle: '2022 Honda City', timeAgo: '1h ago' },
  { id: 'm2', name: 'Jane Smith', listingTitle: '2021 Hyundai Creta', timeAgo: '3h ago' },
  { id: 'm3', name: 'Rahul Kumar', listingTitle: '2023 Maruti Swift', timeAgo: '5h ago' }
];

export default function DNPScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedCity } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADS' | 'INVENTORY'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  const isDealer = user?.userType === 'DEALER';

  const filteredLeads = leads.filter(l =>
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.listingTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    if (user?.id) {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          getSellerStats(user.id).catch(() => MOCK_STATS),
          getLeads(user.id).catch(() => ({ leads: MOCK_LEADS }))
        ]);
        setStats(statsRes || MOCK_STATS);
        setLeads(leadsRes.leads || MOCK_LEADS);
      } catch (err) {
        console.warn('DNP Data error:', err);
        setStats(MOCK_STATS);
        setLeads(MOCK_LEADS);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } else {
      setStats(MOCK_STATS);
      setLeads(MOCK_LEADS);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRegisterDealer = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await updateUser(user.id, { userType: 'DEALER' } as any);
      alert('Congratulations! You are now a Dealer. Please complete your profile to get a Verified Badge.');
      navigation.navigate('CompleteProfile');
    } catch (err) {
      alert('Failed to upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Logo height={38} width={150} />
        <View style={styles.headerTopRight}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-outline" size={16} color={COLORS.black2} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
          </Pressable>

          <Pressable style={styles.headerIconButton} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Notifications' } } } as any)}>
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

      <View style={styles.tabBar}>
        <TabItem label="Overview" active={activeTab === 'OVERVIEW'} onPress={() => setActiveTab('OVERVIEW')} />
        <TabItem label="Leads" active={activeTab === 'LEADS'} onPress={() => setActiveTab('LEADS')} />
        <TabItem label="Inventory" active={activeTab === 'INVENTORY'} onPress={() => setActiveTab('INVENTORY')} />
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <StatItem value={stats?.activeListings || 0} label="Active Cars" color={COLORS.secondary} />
        <View style={styles.statDivider} />
        <StatItem
          value={`₹${(stats?.totalEarnings || 0).toLocaleString()}`}
          label={isDealer ? 'Commissions' : 'Revenue'}
          color={COLORS.success}
        />
        <View style={styles.statDivider} />
        <StatItem value={stats?.soldCars || 0} label="Sold" color={COLORS.coral} />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <ActionItem
          icon="car-sport"
          label={isDealer ? 'Sell for Owner' : 'List My Car'}
          color={COLORS.secondary}
          onPress={() => navigation.navigate('FillDetails', {})}
        />
        <ActionItem
          icon="list"
          label="My Inventory"
          color={COLORS.primary}
          onPress={() => navigation.navigate('ListingManagement')}
        />
        <ActionItem
          icon="wallet"
          label="Earnings"
          color={COLORS.success}
          onPress={() => navigation.navigate('Wallet')}
        />
        <ActionItem
          icon="shield-checkmark"
          label="Verification"
          color="#8b5cf6"
          onPress={() => navigation.navigate('Kyc')}
        />
      </View>
    </View>
  );

  const renderRecentLeads = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Leads</Text>
        <Pressable onPress={() => setActiveTab('LEADS')}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>
      {leads.length > 0 ? leads.slice(0, 3).map((lead, i) => (
        <LeadCard key={lead.id || i} lead={lead} />
      )) : (
        <View style={styles.emptyLeads}>
          <Ionicons name="people-outline" size={40} color={COLORS.grey} />
          <Text style={styles.emptyLeadsText}>No active leads yet</Text>
        </View>
      )}
    </View>
  );

  const renderPromotion = () => (
    <View style={styles.promoContainer}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80' }}
        style={styles.promoCard}
        imageStyle={{ borderRadius: 20 }}
      >
        <View style={styles.promoOverlay} />
        <View style={styles.promoContent}>
          <View style={styles.promoHeader}>
            <MaterialCommunityIcons name="crown" size={32} color={COLORS.primary} />
            <Text style={styles.promoTag}>PREMIUM</Text>
          </View>
          <Text style={styles.promoTitle}>Boost Your Sales</Text>
          <Text style={styles.promoDesc}>Get featured placement & 5x more buyer leads with DNP Premium.</Text>
          <Pressable style={styles.promoBtn}>
            <Text style={styles.promoBtnText}>Upgrade Now</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable withTabBar>
      <StatusBar style="dark" />
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'OVERVIEW' && (
          <>
            {renderStats()}

            {!user?.isVerified && (
              <Pressable style={styles.verifyBanner} onPress={() => navigation.navigate('Kyc')}>
                <View style={styles.verifyIconWrap}>
                  <Ionicons name="shield-outline" size={20} color={COLORS.coral} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifyTitle}>Verify Your Business</Text>
                  <Text style={styles.verifySub}>Get the 'Verified Dealer' badge & build trust.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
              </Pressable>
            )}

            {!isDealer && (
              <Pressable style={styles.dealerUpgradeCard} onPress={handleRegisterDealer}>
                <View style={styles.dealerUpgradeContent}>
                  <Text style={styles.upgradeTitle}>Become a Dealer</Text>
                  <Text style={styles.upgradeSub}>Scale your business with advanced tools.</Text>
                </View>
                <View style={styles.upgradeIconWrap}>
                  <Ionicons name="business" size={24} color={COLORS.white} />
                </View>
              </Pressable>
            )}

            {renderQuickActions()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification Center</Text>
              <View style={styles.verifCenterCard}>
                <VerifStatusItem
                  label="Identity Verification"
                  status={user?.isVerified ? 'VERIFIED' : 'PENDING'}
                  onPress={() => navigation.navigate('Kyc')}
                />
                <VerifStatusItem
                  label="Business License"
                  status={isDealer ? 'VERIFIED' : 'NOT_SUBMITTED'}
                  onPress={() => navigation.navigate('Kyc')}
                />
                <VerifStatusItem
                  label="RC & Insurance"
                  status="NOT_SUBMITTED"
                  onPress={() => navigation.navigate('ListingManagement')}
                />
              </View>
            </View>

            {renderRecentLeads()}
            {renderPromotion()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trust & Safety</Text>
              <View style={styles.trustCard}>
                 <Ionicons name="shield-checkmark" size={40} color={COLORS.success} />
                 <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.trustTitle}>Safe Transaction Process</Text>
                    <Text style={styles.trustDesc}>Our fraud protection system ensures secure payments & genuine buyer-seller connections.</Text>
                 </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Market Insights</Text>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={[styles.insightIcon, { backgroundColor: COLORS.lightBlue1 }]}>
                    <Ionicons name="trending-up" size={20} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.insightTitle}>Trending This Week</Text>
                </View>
                <Text style={styles.insightText}>Demand for compact SUVs has increased by 18% in your region. Consider listing similar inventory.</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'LEADS' && (
          <View style={styles.tabContent}>
             <View style={styles.inventoryTools}>
                <View style={styles.searchBarDNP}>
                   <Ionicons name="search" size={18} color={COLORS.grey} />
                   <TextInput
                     placeholder="Search leads..."
                     style={styles.searchInputDNP}
                     placeholderTextColor={COLORS.grey}
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                   />
                </View>
             </View>
             <View style={styles.leadsList}>
                {filteredLeads.length > 0 ? filteredLeads.map((lead, i) => (
                    <LeadCard key={lead.id || i} lead={lead} full />
                )) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={60} color={COLORS.lightGrey1} />
                        <Text style={styles.emptyStateText}>{searchQuery ? 'No matching leads' : 'No leads found'}</Text>
                    </View>
                )}
             </View>
          </View>
        )}

        {activeTab === 'INVENTORY' && (
           <View style={styles.tabContent}>
             <View style={styles.inventoryHeader}>
                <Text style={styles.inventoryCount}>{stats?.activeListings || 0} Vehicles Listed</Text>
                <Pressable style={styles.addBtn} onPress={() => navigation.navigate('FillDetails', {})}>
                    <Ionicons name="add" size={20} color={COLORS.white} />
                    <Text style={styles.addBtnText}>Add New</Text>
                </Pressable>
             </View>

             {/* Search and Comparison Tools */}
             <View style={styles.inventoryTools}>
                <View style={styles.searchBarDNP}>
                   <Ionicons name="search" size={18} color={COLORS.grey} />
                   <TextInput
                     placeholder="Search inventory..."
                     style={styles.searchInputDNP}
                     placeholderTextColor={COLORS.grey}
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                   />
                </View>
                <Pressable style={styles.compareBtn} onPress={() => navigation.navigate('PlaceholderScreen', { title: 'Comparison Tool' })}>
                   <MaterialCommunityIcons name="compare-horizontal" size={20} color={COLORS.secondary} />
                   <Text style={styles.compareBtnText}>Compare</Text>
                </Pressable>
             </View>

             <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={60} color={COLORS.lightGrey1} />
                <Text style={styles.emptyStateText}>{searchQuery ? 'No matching listings' : 'Manage your active listings here'}</Text>
                <Pressable style={styles.outlineBtn} onPress={() => navigation.navigate('ListingManagement')}>
                    <Text style={styles.outlineBtnText}>View All Listings</Text>
                </Pressable>
             </View>
           </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function TabItem({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.activeIndicator} />}
    </Pressable>
  );
}

function StatItem({ value, label, color }: { value: any, label: string, color: string }) {
  const strVal = String(value);
  const hasRupee = strVal.startsWith('₹');
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>
        {hasRupee && <Text style={{ fontFamily: undefined }}>₹</Text>}{hasRupee ? strVal.slice(1) : strVal}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionItem({ icon, label, color, onPress }: { icon: any, label: string, color: string, onPress: () => void }) {
  return (
    <Pressable style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabelText}>{label}</Text>
    </Pressable>
  );
}

function VerifStatusItem({ label, status, onPress }: { label: string, status: 'VERIFIED' | 'PENDING' | 'NOT_SUBMITTED', onPress: () => void }) {
  const getStatusColor = () => {
    if (status === 'VERIFIED') return COLORS.success;
    if (status === 'PENDING') return COLORS.accent;
    return COLORS.grey;
  };

  const getStatusText = () => {
    if (status === 'VERIFIED') return 'Verified';
    if (status === 'PENDING') return 'Pending';
    return 'Not Verified';
  };

  const getStatusIcon = () => {
    if (status === 'VERIFIED') return 'checkmark-circle';
    if (status === 'PENDING') return 'time';
    return 'alert-circle';
  };

  return (
    <Pressable style={styles.verifItem} onPress={onPress}>
      <Text style={styles.verifLabel}>{label}</Text>
      <View style={[styles.verifBadge, { backgroundColor: getStatusColor() + '15' }]}>
        <Ionicons name={getStatusIcon()} size={14} color={getStatusColor()} />
        <Text style={[styles.verifStatusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
      </View>
    </Pressable>
  );
}

function LeadCard({ lead, full }: { lead: any, full?: boolean }) {
  const handleAction = (type: string) => {
    Alert.alert('Contact Customer', `Starting ${type} with ${lead.name || 'Customer'}...`);
  };

  return (
    <View style={[styles.leadCard, full && { marginHorizontal: 20 }]}>
      <View style={styles.leadAvatarWrap}>
        <Text style={styles.leadInitials}>{(lead.name || 'C').charAt(0)}</Text>
      </View>
      <View style={styles.leadInfo}>
        <Text style={styles.leadName}>{lead.name || 'Customer'}</Text>
        <Text style={styles.leadCar} numberOfLines={1}>{lead.listingTitle || 'Toyota Fortuner 2021'}</Text>
        <Text style={styles.leadTime}>{lead.timeAgo || '2h ago'}</Text>
      </View>
      <View style={styles.leadActions}>
        <Pressable style={[styles.leadActionBtn, { backgroundColor: COLORS.success }]} onPress={() => handleAction('call')}>
          <Ionicons name="call" size={16} color={COLORS.white} />
        </Pressable>
        <Pressable style={[styles.leadActionBtn, { backgroundColor: COLORS.secondary }]} onPress={() => handleAction('chat')}>
          <Ionicons name="chatbubble" size={16} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: TAB_BAR_HEIGHT + 20 },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  headerTop: {
    height: 64,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTopRight: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  headerIconButton: { padding: 4 },
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
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    alignItems: 'center',
  },
  tabActive: {},
  tabLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.medium,
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.bold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },

  statsContainer: { padding: 20 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...TYPOGRAPHY.h6, marginBottom: 4 },
  statLabel: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  statDivider: { width: 1, height: '60%', backgroundColor: COLORS.lightGrey1, alignSelf: 'center' },

  verifyBanner: {
    marginHorizontal: 20,
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  verifyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifyTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: '#9a3412' },
  verifySub: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: '#c2410c' },

  dealerUpgradeCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dealerUpgradeContent: { flex: 1 },
  upgradeTitle: { ...TYPOGRAPHY.h6, color: COLORS.white, fontSize: 18 },
  upgradeSub: { ...TYPOGRAPHY.bodySmall, color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  upgradeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { ...TYPOGRAPHY.h6, color: COLORS.black2, fontSize: 18 },
  viewAllText: { ...TYPOGRAPHY.bodySmall, color: COLORS.secondary, fontFamily: FONTS.poppins.bold },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionItem: {
    width: (SCREEN_W - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabelText: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },

  verifCenterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  verifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  verifLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.black2, fontFamily: FONTS.poppins.medium },
  verifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifStatusText: { fontSize: 12, fontFamily: FONTS.poppins.bold },

  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  trustTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: '#166534' },
  trustDesc: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: '#15803d', marginTop: 4, lineHeight: 18 },

  leadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  leadAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leadInitials: { ...TYPOGRAPHY.bodyMedium, color: COLORS.secondary, fontFamily: FONTS.poppins.bold },
  leadInfo: { flex: 1 },
  leadName: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  leadCar: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted },
  leadTime: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.grey, marginTop: 2 },
  leadActions: { flexDirection: 'row', gap: 8 },
  leadActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  promoContainer: { paddingHorizontal: 20, marginBottom: 25 },
  promoCard: { height: 180, justifyContent: 'flex-end', padding: 20 },
  promoOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  promoContent: { zIndex: 1 },
  promoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  promoTag: { color: COLORS.primary, fontFamily: FONTS.poppins.bold, fontSize: 12 },
  promoTitle: { ...TYPOGRAPHY.h5, color: COLORS.white },
  promoDesc: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, opacity: 0.9, fontSize: 12, marginTop: 4 },
  promoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  promoBtnText: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },

  insightCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  insightIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  insightText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, lineHeight: 20 },

  emptyLeads: { alignItems: 'center', padding: 20 },
  emptyLeadsText: { ...TYPOGRAPHY.bodySmall, color: COLORS.grey, marginTop: 10 },

  tabContent: { paddingVertical: 20 },
  leadsList: { paddingBottom: 20 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 15 },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inventoryCount: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 12 },

  inventoryTools: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  searchBarDNP: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    gap: 8,
  },
  searchInputDNP: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.black2,
    padding: 0,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  compareBtnText: {
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
  },

  outlineBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  outlineBtnText: { ...TYPOGRAPHY.bodySmall, color: COLORS.secondary, fontFamily: FONTS.poppins.bold },
});
