import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS, getShadow } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPWalletScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);

  const fetchWallet = async () => {
    try {
      const data = await request<any>('/api/dnp/wallet');
      setWallet(data.summary);
      setLedger(data.ledger || []);
    } catch (error) {
      console.error('Wallet Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const getTxIcon = (type: string) => {
    if (type.includes('COMMISSION')) return 'add-circle-outline';
    if (type.includes('RECOVERY')) return 'shield-checkmark-outline';
    if (type.includes('WITHDRAWAL')) return 'arrow-down-circle-outline';
    return 'receipt-outline';
  };

  const getTxColor = (type: string, amount: number) => {
    if (amount > 0) return COLORS.green;
    if (amount < 0) return COLORS.coral;
    return COLORS.grey;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainDrawer')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Earnings & Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
      >
        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceTypeBadge}>
              <Ionicons name="wallet" size={12} color={COLORS.white} />
              <Text style={styles.balanceTypeText}>DNP WALLET</Text>
            </View>
            <Pressable style={styles.withdrawBtn} onPress={() => navigation.navigate('DNPWithdraw')}>
              <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
              <Ionicons name="arrow-forward" size={12} color={COLORS.secondary} />
            </Pressable>
          </View>

          <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
          <Text style={styles.balanceValue}>₹{(wallet?.availableBalance || 0).toLocaleString('en-IN')}</Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.statBox}>
              <View style={styles.statIconSmall}>
                <Ionicons name="time" size={14} color="rgba(255,255,255,0.6)" />
              </View>
              <View>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statValue}>₹{(wallet?.pendingEarnings || 0).toLocaleString('en-IN')}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={styles.statIconSmall}>
                <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.6)" />
              </View>
              <View>
                <Text style={styles.statLabel}>Approved</Text>
                <Text style={styles.statValue}>₹{(wallet?.approvedEarnings || 0).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Membership Recovery Progress */}
        <View style={styles.recoveryCard}>
          <View style={styles.recoveryHeader}>
            <View style={styles.recoveryIconCircle}>
              <MaterialCommunityIcons name="shield-crown" size={24} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recoveryTitle}>Membership Recovery</Text>
              <Text style={styles.recoverySubtitle}>Fee is paid via your earnings</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressPercent}>{Math.round(((wallet?.recoveredFee || 0) / 5000) * 100)}% Complete</Text>
              <Text style={styles.progressAmount}>₹{(wallet?.recoveredFee || 0).toLocaleString('en-IN')} / ₹5,000</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((wallet?.recoveredFee || 0) / 5000) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.recoveryDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Fee</Text>
              <Text style={styles.detailValue}>₹5,000</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remaining</Text>
              <Text style={styles.detailValueHighlight}>₹{(wallet?.remainingFee || 5000).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Transaction Ledger */}
        <Text style={styles.sectionTitle}>Wallet Ledger</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 20 }} />
        ) : ledger.length > 0 ? (
          ledger.map((tx) => (
            <View key={tx.id} style={styles.txItem}>
              <View style={[styles.txIcon, { backgroundColor: getTxColor(tx.type, tx.amount) + '15' }]}>
                <Ionicons name={getTxIcon(tx.type) as any} size={20} color={getTxColor(tx.type, tx.amount)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txTitle}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: getTxColor(tx.type, tx.amount) }]}>
                {tx.amount > 0 ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No wallet activity found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    padding: 24,
    marginBottom: 24,
    ...getShadow(0, 10, 0.25, 20, COLORS.secondary, 8)
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  balanceTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceTypeText: {
    color: COLORS.white,
    fontSize: 9,
    fontFamily: FONTS.poppins.bold,
    letterSpacing: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.poppins.medium,
    marginBottom: 2
  },
  balanceValue: {
    fontSize: 36,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    marginBottom: 24
  },
  withdrawBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  withdrawBtnText: { color: COLORS.secondary, fontSize: 11, fontFamily: FONTS.poppins.bold },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 16
  },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: FONTS.poppins.medium },
  statValue: { fontSize: 13, fontFamily: FONTS.poppins.bold, color: COLORS.white },
  statDivider: { width: 1, height: '70%', backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 10 },
  recoveryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...getShadow(0, 4, 0.03, 12, "#000", 2),
  },
  recoveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  recoveryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoveryTitle: { fontSize: 15, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  recoverySubtitle: { fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  progressSection: { marginBottom: 20 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressPercent: { fontSize: 14, fontFamily: FONTS.poppins.bold, color: COLORS.secondary },
  progressAmount: { fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.poppins.bold },
  progressBar: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.secondary, borderRadius: 5 },
  recoveryDetails: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  detailRow: { flex: 1 },
  detailLabel: { fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.poppins.bold, textTransform: 'uppercase', marginBottom: 2 },
  detailValue: { fontSize: 15, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  detailValueHighlight: { fontSize: 15, fontFamily: FONTS.poppins.bold, color: COLORS.secondary },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 16 },
  txItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...getShadow(0, 2, 0.03, 8, "#000", 1)
  },
  txIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txTitle: { fontSize: 13, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 2 },
  txDate: { fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  txAmount: { fontSize: 15, fontFamily: FONTS.poppins.bold },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 12, fontFamily: FONTS.poppins.medium },
});
