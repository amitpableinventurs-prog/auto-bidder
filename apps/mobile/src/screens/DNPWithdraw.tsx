import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPWithdrawScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await request<any>('/api/dnp/wallet');
        setAvailableBalance(data.summary?.availableBalance || 0);
      } catch (error) {
        console.error('Fetch Balance Error:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchBalance();
  }, []);

  const handleWithdraw = async () => {
    const withdrawalAmount = parseInt(amount);

    if (!withdrawalAmount || withdrawalAmount < 1000) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is ₹1,000');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance');
      return;
    }

    setLoading(true);
    try {
      await request<any>('/api/dnp/withdrawals', {
        method: 'POST',
        body: JSON.stringify({ amount: withdrawalAmount }),
      });

      Alert.alert(
        'Withdrawal Requested',
        'Your request for ₹' + withdrawalAmount.toLocaleString('en-IN') + ' has been submitted. It will be credited to your registered bank account within 3-5 business days.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Withdraw Earnings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
          <Text style={styles.balanceAmount}>₹{availableBalance.toLocaleString('en-IN')}</Text>
          <Text style={styles.balanceNote}>Transfer to registered bank account</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={COLORS.grey}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Pressable style={styles.maxBtn} onPress={() => setAmount(availableBalance.toString())}>
              <Text style={styles.maxBtnText}>MAX</Text>
            </Pressable>
          </View>
          <Text style={styles.minNote}>Minimum withdrawal: ₹1,000</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Verification Policy</Text>
            <Text style={styles.infoDesc}>
              Withdrawals are subject to manual audit and fraud verification. Funds are settled to the primary bank account linked to your Auto Bidder profile.
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.withdrawBtn, (!amount || parseInt(amount) < 1000) && styles.withdrawBtnDisabled]}
          onPress={handleWithdraw}
          disabled={!amount || parseInt(amount) < 1000 || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.withdrawBtnText}>Request Withdrawal</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  balanceCard: { backgroundColor: '#F8F9FA', borderRadius: 24, padding: 24, marginBottom: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.lightGrey2 },
  balanceLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginBottom: 8 },
  balanceAmount: { ...TYPOGRAPHY.h2, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 8 },
  balanceNote: { ...TYPOGRAPHY.bodySmall, fontSize: 11, color: COLORS.grey },
  section: { marginBottom: 32 },
  sectionTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 16 },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: COLORS.lightGrey2 },
  currencySymbol: { ...TYPOGRAPHY.h4, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginRight: 12 },
  amountInput: { ...TYPOGRAPHY.h4, fontFamily: FONTS.poppins.bold, color: COLORS.black2, flex: 1 },
  maxBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.secondary, borderRadius: 10 },
  maxBtnText: { color: COLORS.white, fontSize: 11, fontFamily: FONTS.poppins.bold },
  minNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 8, marginLeft: 4 },
  infoCard: { flexDirection: 'row', backgroundColor: COLORS.lightBlue1, padding: 20, borderRadius: 20, alignItems: 'flex-start', gap: 12, marginBottom: 40 },
  infoContent: { flex: 1 },
  infoTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, marginBottom: 4 },
  infoDesc: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, paddingVertical: 18, borderRadius: 18, gap: 8, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  withdrawBtnDisabled: { backgroundColor: COLORS.lightGrey1, shadowOpacity: 0, elevation: 0 },
  withdrawBtnText: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.white },
});
