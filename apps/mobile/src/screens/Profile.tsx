import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getSellerStats } from '../api';
import NeedAssistance from '../components/NeedAssistance';
import Logo from '../components/Logo';
import { useAppStore } from '../store/useAppStore';
import { COLORS as THEME_COLORS, FONTS } from '../theme';

const COLORS = {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  surface2: "#F1F5F9",
  border: "#E2E8F0",
  accent: "#FFC107",
  blue: "#2563EB",
  text: "#1E293B",
  textMuted: "#64748B",
  textDim: "#94A3B8",
  red: "#EF4444",
  green: "#10B981",
  gold: "#D4AF37"
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedCity } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getSellerStats(user!.id);
      setStats(res);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const menuItems = [
    { id: 'wishlist', label: 'My Watchlist', icon: 'heart-outline', color: COLORS.red, count: stats?.activeListings },
    { id: 'my-bids', label: 'Bidding Activity', icon: 'flash-outline', color: COLORS.accent, count: stats?.bidsPlaced },
    { id: 'wallet', label: 'Payments & Wallet', icon: 'wallet-outline', color: COLORS.green },
    { id: 'history', label: 'Purchase History', icon: 'time-outline', color: COLORS.blue },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', color: COLORS.accent },
    { id: 'settings', label: 'App Settings', icon: 'settings-outline', color: COLORS.textMuted },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Admin Command Center', icon: 'shield-checkmark-outline', color: COLORS.blue });
  }

  const onNavigate = (screen: string) => {
    if (screen === 'wishlist') {
      navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Saved Cars' } } } as any);
      return;
    }
    if (screen === 'my-bids') {
      navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Bids Placed' } } } as any);
      return;
    }
    if (screen === 'notifications') {
      navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Notifications' } } } as any);
      return;
    }

    const routeMap: Record<string, keyof RootStackParamList> = {
        'wallet': 'Wallet',
        'history': 'History',
        'settings': 'Settings',
        'admin': 'AdminDashboard'
    };
    const route = routeMap[screen];
    if (route) {
        navigation.navigate(route as any);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Top App Header consistent with Main screen */}
      <View style={styles.appTopHeader}>
        <Logo />
        <View style={styles.appTopHeaderRight}>
          <Pressable style={styles.appIconBtn} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-outline" size={26} color={THEME_COLORS.text} />
          </Pressable>

          <Pressable style={styles.appIconBtn} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Notifications' } } } as any)}>
            <Ionicons name="notifications-outline" size={26} color={THEME_COLORS.text} />
          </Pressable>

          <Pressable style={styles.appAvatarBtn} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/100" }}
                style={styles.appAvatar}
              />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Personal Space</Text>
            <Text style={styles.headerTitle}>Account</Text>
          </View>
          <Pressable style={styles.editBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrap}>
                <Image
                source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/100' }}
                style={styles.avatar}
                />
                {user?.isVerified && (
                    <View style={styles.verifyBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={24} color={COLORS.blue} />
                    </View>
                )}
            </View>
            <View style={styles.userMainInfo}>
                <Text style={styles.userName}>{user?.name || 'Vaibhav Soni'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'vaibhav@autobidder.in'}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.userType || 'BUYER'}</Text>
                </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.bidsPlaced || 0}</Text>
              <Text style={styles.statLabel}>Bids</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.carsWon || 0}</Text>
              <Text style={styles.statLabel}>Won</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}><Text style={{ fontFamily: undefined }}>₹</Text> {stats?.savings ? (stats.savings / 1000).toFixed(1) + 'k' : '0'}</Text>
              <Text style={styles.statLabel}>Savings</Text>
            </View>
          </View>

          <Pressable
            style={styles.profileEditAction}
            onPress={() => {
                navigation.navigate('EditProfile');
            }}
          >
            <Ionicons name="pencil" size={14} color={COLORS.blue} />
            <Text style={styles.profileEditActionText}>Edit Profile Information</Text>
          </Pressable>
        </View>

        {/* Real User Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="call-outline" size={20} color={COLORS.blue} />
              </View>
              <View style={styles.detailTextWrap}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="location-outline" size={20} color={COLORS.blue} />
              </View>
              <View style={styles.detailTextWrap}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>
                  {user?.address ? `${user.address}, ${user.city || ''} ${user.zipCode || ''}` : 'No address added'}
                </Text>
              </View>
            </View>

            {user?.userType === 'DEALER' && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <View style={styles.detailIconWrap}>
                    <MaterialCommunityIcons name="store-outline" size={20} color={COLORS.blue} />
                  </View>
                  <View style={styles.detailTextWrap}>
                    <Text style={styles.detailLabel}>Business Name</Text>
                    <Text style={styles.detailValue}>{user?.businessName || 'Not specified'}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Dashboard & Preferences</Text>
          <View style={styles.menuGrid}>
              {menuItems.map(item => (
                <Pressable
                  key={item.id}
                  style={styles.gridItem}
                  onPress={() => onNavigate(item.id)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.count && (
                      <View style={styles.countBadge}>
                          <Text style={styles.countText}>{item.count}</Text>
                      </View>
                  )}
                </Pressable>
              ))}
          </View>
        </View>

        <View style={styles.kycBanner}>
           <View style={styles.kycTextWrap}>
              <Text style={styles.kycTitle}>{user?.isVerified ? "Account Verified" : "Verification Pending"}</Text>
              <Text style={styles.kycDesc}>{user?.isVerified ? "You have full access to bidding and selling." : "Complete your KYC to start placing bids on premium cars."}</Text>
           </View>
           {!user?.isVerified && (
               <Pressable style={styles.kycBtn} onPress={() => navigation.navigate('Kyc' as any)}>
                  <Text style={styles.kycBtnText}>VERIFY</Text>
               </Pressable>
           )}
           {user?.isVerified && (
               <Ionicons name="checkmark-circle" size={32} color={COLORS.green} />
           )}
        </View>

        <NeedAssistance />

        <Pressable style={styles.logoutBtn} onPress={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  appTopHeader: {
    height: 64,
    backgroundColor: COLORS.bg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appTopHeaderRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  appIconBtn: { padding: 4 },
  appAvatarBtn: { marginLeft: 4 },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appAvatar: { width: "100%", height: "100%", borderRadius: 20, backgroundColor: COLORS.surface2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textDim,
    fontFamily: FONTS.poppins.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    fontFamily: FONTS.poppins.black,
    marginTop: -4
  },
  editBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  profileCard: {
    backgroundColor: COLORS.bg,
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: COLORS.surface2
  },
  verifyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
  },
  userMainInfo: {
    marginLeft: 20,
    flex: 1
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: FONTS.poppins.extraBold
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 2,
    fontFamily: FONTS.poppins.medium
  },
  roleBadge: {
    backgroundColor: COLORS.surface2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: FONTS.poppins.extraBold
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 2,
    fontFamily: FONTS.poppins.bold,
    textTransform: 'uppercase'
  },
  vDivider: { width: 1, height: 25, backgroundColor: COLORS.border },
  profileEditAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6
  },
  profileEditActionText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '700',
    fontFamily: FONTS.poppins.bold
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailTextWrap: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textDim,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'Poppins_700Bold',
    marginTop: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginLeft: 56,
  },
  menuSection: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingLeft: 4,
    fontFamily: FONTS.poppins.extraBold
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1.1
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.poppins.bold,
    textAlign: 'center'
  },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.red,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  countText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800'
  },
  kycBanner: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: COLORS.surface2,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed'
  },
  kycTextWrap: {
    flex: 1,
    paddingRight: 12
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: FONTS.poppins.extraBold
  },
  kycDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.medium,
    marginTop: 2
  },
  kycBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  kycBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: FONTS.poppins.black
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
    paddingVertical: 10
  },
  logoutText: {
    color: COLORS.red,
    fontWeight: '800',
    fontSize: 16,
    fontFamily: FONTS.poppins.extraBold
  }
});
