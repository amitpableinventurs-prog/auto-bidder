import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getAdminDashboard } from '../../api';

const DARK = '#0f172a';
const LIGHT = '#f8fafc';
const BLUE = '#2563eb';

export default function AdminRevenueAnalytics() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(res => setData(res))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = data?.stats?.totalRevenue || 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Revenue Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
            <Text style={styles.label}>Net Revenue (Total)</Text>
            <Text style={styles.value}><Text style={{ fontFamily: undefined }}>₹</Text> {totalRevenue.toLocaleString()}</Text>
            <View style={styles.growthRow}>
                <Ionicons name="trending-up" size={16} color="#10b981" />
                <Text style={styles.growthText}>Live Platform Earnings</Text>
            </View>
        </View>

        {loading ? (
          <ActivityIndicator color={BLUE} style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart" size={40} color="#cbd5e1" />
                <Text style={styles.chartText}>Analytics Overview</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Active Auctions</Text>
                    <Text style={styles.statValue}>{data.stats.activeListings}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Listings</Text>
                    <Text style={styles.statValue}>{data.stats.listings}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Submitted Bids</Text>
                    <Text style={styles.statValue}>{data.stats.submittedBids}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Pending Apps</Text>
                    <Text style={styles.statValue}>{data.stats.pendingAppointments}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Performance Summary</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              The platform currently has {data.stats.users} registered users with {data.stats.activeListings} live auctions.
              {data.stats.pendingListings} cars are awaiting inspection.
            </Text>
          </>
        )}
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
  mainCard: { backgroundColor: DARK, borderRadius: 24, padding: 25, marginBottom: 20 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'uppercase' },
  value: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 5 },
  growthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15 },
  growthText: { color: '#10b981', fontSize: 12, fontWeight: '600' },
  chartPlaceholder: { height: 200, backgroundColor: '#fff', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  chartText: { color: '#94a3b8', fontSize: 13, marginTop: 10, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
  statBox: { width: '47.5%', backgroundColor: '#fff', padding: 15, borderRadius: 16, elevation: 2 },
  statLabel: { fontSize: 11, color: '#94a3b8' },
  statValue: { fontSize: 16, fontWeight: '800', color: DARK, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DARK, marginBottom: 20 },
});
