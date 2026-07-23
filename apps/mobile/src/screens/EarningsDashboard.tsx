import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as api from '../api';

import { COLORS } from '../theme';
const DARK = '#0f172a';
const BLUE = COLORS.secondary;
const LIGHT = '#f8fafc';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';

export default function EarningsDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const userId = user?.id;
  const [stats, setStats] = React.useState<any>(null);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }

    Promise.all([
      api.getSellerStats(userId),
      api.getUserPayments(userId)
    ])
    .then(([statsRes, paymentsRes]) => {
      setStats(statsRes);
      setPayments(paymentsRes.payments);
    })
    .catch(err => console.warn(err))
    .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <View style={styles.safe}><ActivityIndicator color={BLUE} style={{ marginTop: 40 }} /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Earnings Dashboard</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.label}>Net Earnings</Text>
                    <Text style={styles.value}><Text style={{ fontFamily: undefined }}>₹</Text> {(stats?.totalEarnings || 0).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="bank-transfer" size={32} color="#fff" />
                </View>
            </View>
            <View style={styles.hDivider} />
            <View style={styles.row}>
                <View>
                    <Text style={styles.subLabel}>Active Listings</Text>
                    <Text style={styles.subValue}>{stats?.activeListings || 0}</Text>
                </View>
                <View>
                    <Text style={[styles.subLabel, { textAlign: 'right' }]}>Sold Cars</Text>
                    <Text style={[styles.subValue, { textAlign: 'right' }]}>{stats?.soldCars || 0}</Text>
                </View>
            </View>
        </View>

        <Text style={styles.sectionTitle}>Payout History</Text>
        {payments.length === 0 ? (
          <View style={styles.emptyPayouts}>
            <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No payouts recorded yet.</Text>
          </View>
        ) : (
          payments.map(p => (
            <View key={p.id} style={styles.payoutCard}>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutTitle}>{p.listing?.title || 'Payment Received'}</Text>
                <Text style={styles.payoutDate}>{new Date(p.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.payoutAmount}><Text style={{ fontFamily: undefined }}>₹</Text> {(p.amount ?? 0).toLocaleString('en-IN')}</Text>
                <View style={[styles.statusBadge, p.status === 'SUCCEEDED' ? styles.statusPaid : styles.statusPending]}>
                  <Text style={[styles.statusText, p.status === 'SUCCEEDED' ? styles.statusTextPaid : styles.statusTextPending]}>
                    {p.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        <Pressable style={styles.reportBtn}>
            <Ionicons name="document-text-outline" size={20} color={BLUE} />
            <Text style={styles.reportBtnText}>Download Tax Report (FY 23-24)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  content: { padding: 20 },
  summaryCard: { backgroundColor: BLUE, borderRadius: 24, padding: 25, elevation: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  value: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 5 },
  iconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  hDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  subLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'uppercase' },
  subValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: DARK, marginBottom: 20, marginTop: 10 },
  payoutCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 12, elevation: 1 },
  payoutInfo: { flex: 1 },
  payoutTitle: { fontSize: 14, fontWeight: '700', color: DARK },
  payoutDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  payoutAmount: { fontSize: 16, fontWeight: '800', color: DARK },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  statusPaid: { backgroundColor: '#ecfdf5' },
  statusPending: { backgroundColor: '#fffbeb' },
  statusText: { fontSize: 12, fontWeight: '900' },
  statusTextPaid: { color: '#059669' },
  statusTextPending: { color: '#d97706' },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BLUE,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 10
  },
  reportBtnText: { color: BLUE, fontWeight: '700', fontSize: 14 },
  emptyPayouts: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94a3b8', marginTop: 12 }
});
