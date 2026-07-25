import { FONTS } from '../theme';
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import * as api from '../api';
import { useAuth } from '../AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';

const COLORS = {
  bg: "#0a0d14",
  surface: "#111827",
  surface2: "#1a2235",
  border: "#1e2d45",
  accent: "#fbbf24",
  blue: "#3b82f6",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  red: "#ef4444",
  green: "#22c55e",
};

export default function Wallet() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
        setLoading(false);
        return;
    }
    api.getWalletBalance(user.id)
        .then(res => setData(res))
        .catch(err => {
            console.warn('Wallet fetch failed', err);
            // Fallback for demo if API fails
            setData({ balance: 25000, transactions: [] });
        })
        .finally(() => setLoading(false));
  }, [user?.id]);

  const transactions = data?.transactions || [];

  if (loading) {
    return (
        <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
    );
  }

  const handleTopUp = async () => {
    if (!user?.id) return;
    try {
        setLoading(true);
        const { payment } = await api.createPayment(5000);

        // In demo mode with memory store, this returns a fake payment immediately
        // In real mode, it would provide a clientSecret for Stripe

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Top Up Successful', '₹ 5,000 has been added to your wallet.');
        setShowTopUp(false);
        // Refresh balance
        const res = await api.getWalletBalance(user.id);
        setData(res);
    } catch (err: any) {
        Alert.alert('Error', err.message || 'Payment failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.safe}>
      <StatusBar style="light" />

      <View style={[styles.header, {
        paddingLeft: Math.max(insets.left, 20),
        paddingRight: Math.max(insets.right, 20)
      }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Digital Wallet</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Ionicons name="shield-checkmark" size={16} color={COLORS.green} />
             <Text style={styles.secureText}>SECURE BALANCE</Text>
          </View>
          <Text style={styles.balanceValue}><Text style={{ fontFamily: undefined }}>₹</Text> {(data?.balance || 25000).toLocaleString('en-IN')}.00</Text>
          <Text style={styles.balanceLabel}>Available for Bidding</Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.addBtn} onPress={() => setShowTopUp(true)}>
              <Ionicons name="add-circle" size={18} color="#000" />
              <Text style={styles.addText}>TOP UP</Text>
            </Pressable>
            <Pressable style={styles.withdrawBtn}>
              <Ionicons name="arrow-up-circle-outline" size={18} color={COLORS.text} />
              <Text style={styles.withdrawText}>WITHDRAW</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.emiCard}>
            <View style={styles.emiInfo}>
                <Text style={styles.emiTitle}>Financing & EMI</Text>
                <Text style={styles.emiSub}>Get instant credit up to <Text style={{ fontFamily: undefined }}>₹</Text> 10 Lakhs</Text>
            </View>
            <Pressable style={styles.applyBtn}>
                <Text style={styles.applyText}>APPLY NOW</Text>
            </Pressable>
        </View>

        <View style={styles.referralCard}>
            <View style={styles.referralIcon}>
                <MaterialCommunityIcons name="gift-outline" size={30} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.referralTitle}>Refer & Earn Commission</Text>
                <Text style={styles.referralSub}>Get up to 1% commission on car sales.</Text>
            </View>
            <Pressable style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>SHARE</Text>
            </Pressable>
        </View>

        <View style={styles.historyWrap}>
          <View style={styles.historyHeader}>
             <Text style={styles.sectionTitle}>Transaction Activity</Text>
             <Pressable><Text style={styles.viewAllText}>FILTER</Text></Pressable>
          </View>

          {transactions.map((tx: any) => {
            const isCredit = tx.type?.toLowerCase() === 'credit';
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: isCredit ? COLORS.green + '15' : COLORS.red + '15' }]}>
                  <Ionicons
                    name={isCredit ? "arrow-down-outline" : "arrow-up-outline"}
                    size={20}
                    color={isCredit ? COLORS.green : COLORS.red}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.title || tx.description}</Text>
                  <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, { color: isCredit ? COLORS.green : COLORS.text }]}>
                      {isCredit ? '+' : '-'} <Text style={{ fontFamily: undefined }}>₹</Text>{Number(tx.amount).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.txStatus}>{tx.status || 'SUCCESS'}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUp} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: insets.left,
              paddingRight: insets.right
            }]}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Payment Method</Text>
                    <Pressable onPress={() => setShowTopUp(false)}>
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </Pressable>
                </View>

                {[
                    { id: 'upi', name: 'UPI (Google Pay, PhonePe)', icon: 'flash' },
                    { id: 'card', name: 'Credit / Debit Card', icon: 'card' },
                    { id: 'net', name: 'Net Banking', icon: 'business' },
                ].map(method => (
                    <Pressable key={method.id} style={styles.methodBtn} onPress={handleTopUp}>
                        <Ionicons name={method.icon as any} size={20} color={COLORS.accent} />
                        <Text style={styles.methodName}>{method.name}</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textDim} />
                    </Pressable>
                ))}
            </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, justifyContent: 'space-between' },
  headerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.poppins.extraBold },

  card: { backgroundColor: COLORS.surface, margin: 20, borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, backgroundColor: COLORS.green + '10', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  secureText: { fontSize: 12, fontWeight: '800', color: COLORS.green, letterSpacing: 1, fontFamily: FONTS.poppins.extraBold },
  balanceValue: { color: COLORS.text, fontSize: 30, fontWeight: '900', fontFamily: FONTS.poppins.black },
  balanceLabel: { color: COLORS.textDim, fontSize: 12, marginTop: 4, fontFamily: FONTS.poppins.medium },

  actionRow: { flexDirection: 'row', marginTop: 32, gap: 12 },
  addBtn: { backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, height: 50, borderRadius: 5, gap: 8 },
  addText: { color: '#000', fontWeight: '800', fontSize: 12, fontFamily: FONTS.poppins.extraBold },
  withdrawBtn: { backgroundColor: COLORS.surface2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, height: 50, borderRadius: 5, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  withdrawText: { color: COLORS.text, fontWeight: '700', fontSize: 12, fontFamily: FONTS.poppins.bold },

  emiCard: { backgroundColor: COLORS.surface2, marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border },
  emiInfo: { flex: 1 },
  emiTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', fontFamily: FONTS.poppins.bold },
  emiSub: { color: COLORS.textDim, fontSize: 12, marginTop: 2, fontFamily: FONTS.poppins.regular },
  applyBtn: { backgroundColor: COLORS.blue, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 5 },
  applyText: { color: '#fff', fontSize: 12, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },

  referralCard: { backgroundColor: COLORS.surface2, marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: COLORS.border },
  referralIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.accent + '15', alignItems: 'center', justifyContent: 'center' },
  referralTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', fontFamily: FONTS.poppins.bold },
  referralSub: { color: COLORS.textDim, fontSize: 12, marginTop: 2, fontFamily: FONTS.poppins.regular },
  shareBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  shareBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },

  historyWrap: { flex: 1, paddingHorizontal: 24, marginTop: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDim, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: FONTS.poppins.extraBold },
  viewAllText: { fontSize: 12, fontWeight: '700', color: COLORS.accent, fontFamily: FONTS.poppins.bold },

  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, fontFamily: FONTS.poppins.bold },
  txDate: { fontSize: 12, color: COLORS.textDim, marginTop: 4, fontFamily: FONTS.poppins.medium },
  txAmount: { fontSize: 16, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },
  txStatus: { fontSize: 12, fontWeight: '800', color: COLORS.textDim, marginTop: 4, fontFamily: FONTS.poppins.bold },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, paddingBottom: 50, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },
  methodBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface2, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  methodName: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '600', marginLeft: 16, fontFamily: FONTS.poppins.semiBold },
});
