import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function DNPWalletScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setWalletData(data.balance);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Wallet Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdraw = () => {
    // TODO: Navigate to withdrawal screen when navigation is updated
    Alert.alert('Coming Soon', 'Withdrawal screen will be available soon');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'COMMISSION_CREDIT': return 'add-circle-outline';
      case 'WITHDRAWAL': return 'arrow-down-circle-outline';
      case 'MEMBERSHIP_FEE': return 'card-outline';
      case 'BONUS': return 'gift-outline';
      default: return 'receipt-outline';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'COMMISSION_CREDIT': return COLORS.success;
      case 'WITHDRAWAL': return COLORS.coral;
      case 'MEMBERSHIP_FEE': return COLORS.accent;
      case 'BONUS': return COLORS.primary;
      default: return COLORS.grey;
    }
  };

  const renderTransactionItem = (transaction: any) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '15' }]}>
        <Ionicons name={getTransactionIcon(transaction.type)} size={20} color={getTransactionColor(transaction.type)} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.type === 'WITHDRAWAL' || transaction.type === 'MEMBERSHIP_FEE' ? COLORS.coral : COLORS.success }
      ]}>
        {transaction.type === 'WITHDRAWAL' || transaction.type === 'MEMBERSHIP_FEE' ? '-' : '+'}
        ₹{transaction.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>DNP Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={32} color={COLORS.secondary} />
            <Text style={styles.balanceTitle}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            ₹{(walletData?.available || 0).toLocaleString()}
          </Text>
          
          <View style={styles.balanceStats}>
            <BalanceStat
              label="Pending"
              value={`₹${(walletData?.pending || 0).toLocaleString()}`}
              color={COLORS.accent}
            />
            <BalanceStat
              label="Lifetime"
              value={`₹${(walletData?.lifetime || 0).toLocaleString()}`}
              color={COLORS.primary}
            />
          </View>

          <Pressable style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Ionicons name="arrow-down-circle" size={20} color={COLORS.white} />
            <Text style={styles.withdrawBtnText}>Withdraw Earnings</Text>
          </Pressable>
        </View>

        {/* Membership Fee Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <MaterialCommunityIcons name="crown" size={24} color={COLORS.primary} />
            <View style={styles.membershipTitle}>
              <Text style={styles.membershipMainTitle}>DNP Membership Fee</Text>
              <Text style={styles.membershipSubtitle}>Annual fee: ₹5,000</Text>
            </View>
          </View>
          
          <View style={styles.membershipStatus}>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={[styles.statusText, { color: COLORS.success }]}>Pay After You Earn</Text>
            </View>
          </View>

          <Text style={styles.membershipDesc}>
            Your membership fee will be automatically deducted from your earnings after you start generating commissions according to company policy.
          </Text>
        </View>

        {/* Commission Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.earningsList}>
            <EarningItem
              icon="car-outline"
              title="Listing Approvals"
              amount={4500}
              count={15}
              color={COLORS.secondary}
            />
            <EarningItem
              icon="cash-outline"
              title="Vehicle Sales"
              amount={35500}
              count={8}
              color={COLORS.success}
            />
            <EarningItem
              icon="gift-outline"
              title="Bonus Rewards"
              amount={2000}
              count={3}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Pressable onPress={fetchWalletData}>
              <Ionicons name="refresh" size={20} color={COLORS.secondary} />
            </Pressable>
          </View>
          
          {transactions.length > 0 ? (
            transactions.map(renderTransactionItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={COLORS.lightGrey1} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Withdrawal Information</Text>
            <Text style={styles.infoDesc}>
              Minimum withdrawal amount: ₹1,000. Withdrawals are processed within 3-5 business days after admin approval and fraud verification.
            </Text>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      )}
    </SafeAreaView>
  );
}

function BalanceStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <View style={styles.balanceStat}>
      <Text style={styles.balanceStatLabel}>{label}</Text>
      <Text style={[styles.balanceStatValue, { color }]}>{value}</Text>
    </View>
  );
}

function EarningItem({ icon, title, amount, count, color }: { 
  icon: any, 
  title: string, 
  amount: number, 
  count: number, 
  color: string 
}) {
  return (
    <View style={styles.earningItem}>
      <View style={[styles.earningIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.earningInfo}>
        <Text style={styles.earningTitle}>{title}</Text>
        <Text style={styles.earningCount}>{count} transactions</Text>
      </View>
      <Text style={[styles.earningAmount, { color }]}>
        ₹{amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  balanceCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  balanceTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255,255,255,0.9)',
  },
  balanceAmount: {
    ...TYPOGRAPHY.h2,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  balanceStatValue: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  withdrawBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  membershipCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginBottom: 20,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  membershipTitle: {
    flex: 1,
  },
  membershipMainTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  membershipSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  membershipStatus: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
  },
  membershipDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  earningsList: {
    gap: 12,
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  earningIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  earningInfo: {
    flex: 1,
  },
  earningTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  earningCount: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  earningAmount: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  transactionDate: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  transactionAmount: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: '#9a3412',
    marginBottom: 4,
  },
  infoDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: '#c2410c',
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
