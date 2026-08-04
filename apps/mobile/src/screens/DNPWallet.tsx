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
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
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
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
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
            <Text style={styles.balanceLabel}>Net Withdrawable Balance</Text>
            <Pressable style={styles.withdrawBtn} onPress={() => navigation.navigate('DNPWithdraw')}>
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </Pressable>
          </View>
          <Text style={styles.balanceValue}>₹{(wallet?.availableBalance || 0).toLocaleString('en-IN')}</Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>₹{(wallet?.pendingEarnings || 0).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Approved</Text>
              <Text style={styles.statValue}>₹{(wallet?.approvedEarnings || 0).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Membership Recovery Progress */}
        <View style={styles.recoveryCard}>
          <View style={styles.recoveryHeader}>
            <MaterialCommunityIcons name="crown" size={24} color={COLORS.secondary} />
            <Text style={styles.recoveryTitle}>Membership Fee Recovery</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((wallet?.recoveredFee || 0) / 5000) * 100}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>Recovered: ₹{(wallet?.recoveredFee || 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.progressText}>Remaining: ₹{(wallet?.remainingFee || 5000).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.grey} />
            <Text style={styles.infoText}>Fees are automatically recovered from your approved earnings.</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  balanceCard: { backgroundColor: COLORS.secondary, borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { ...TYPOGRAPHY.bodySmall, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.poppins.bold },
  balanceValue: { ...TYPOGRAPHY.h3, fontFamily: FONTS.poppins.bold, color: COLORS.white, marginBottom: 24 },
  withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  withdrawBtnText: { color: COLORS.white, fontSize: 11, fontFamily: FONTS.poppins.bold },
  balanceStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  statValue: { fontSize: 14, fontFamily: FONTS.poppins.bold, color: COLORS.white },
  statDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)' },
  recoveryCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.lightGrey2 },
  recoveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  recoveryTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  progressContainer: { marginBottom: 16 },
  progressBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.secondary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.poppins.bold },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 10, color: COLORS.grey, flex: 1 },
  sectionTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 16 },
  txItem: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 2 },
  txDate: { fontSize: 11, color: COLORS.textMuted },
  txAmount: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 12 },
});
