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
import { getAdminDashboard } from '../../api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const DARK = '#0f172a';
const BLUE = '#2563eb';
const LIGHT = '#f8fafc';

export default function AdminDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(res => setData(res))
      .catch(err => console.warn('Admin fetch failed', err))
      .finally(() => setLoading(false));
  }, []);

  const adminModules = [
    { id: 'AdminUsers', label: 'User Management', icon: 'people', color: '#3b82f6' },
    { id: 'AdminSellerVerif', label: 'Seller Verification', icon: 'shield-checkmark', color: '#10b981' },
    { id: 'AdminVehicleVerif', label: 'Vehicle Verification', icon: 'car-sport', color: '#f59e0b' },
    { id: 'AdminRevenue', label: 'Revenue Analytics', icon: 'bar-chart', color: '#06b6d4' },
    { id: 'AdminNews', label: 'News Management', icon: 'newspaper', color: '#8b5cf6' },
  ];

  const stats = [
    { label: 'Active Cars', value: data?.stats?.activeListings || '0', color: '#10b981' },
    { label: 'Total Users', value: data?.stats?.users || '0', color: '#3b82f6' },
    { label: 'Pending Insp', value: data?.stats?.pendingListings || '0', color: '#f59e0b' },
  ];

  if (loading) {
    return (
        <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color={BLUE} size="large" />
            <Text style={{ marginTop: 10, color: DARK }}>Loading Admin Command Center...</Text>
        </View>
    );
  }

  const recentItems = [
    ...(data?.recentBids || []).map((b: any) => ({ text: `New bid ₹${b.amount.toLocaleString()} by ${b.user?.name || 'User'}`, time: 'Recent Bid', type: 'bid' })),
    ...(data?.recentListings || []).map((l: any) => ({ text: `New car listed: ${l.brand} ${l.model}`, time: 'New Listing', type: 'car' })),
  ].slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('MainDrawer')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={DARK} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.welcome}>Admin Command Center</Text>
            <Text style={styles.subWelcome}>AutoBidder System Overview</Text>
          </View>
          <View style={styles.statusBadge}>
             <View style={styles.statusDot} />
             <Text style={styles.statusText}>SYSTEM ONLINE</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <View style={[styles.statLine, { backgroundColor: s.color }]} />
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {adminModules.map((item) => (
            <Pressable
              key={item.id}
              style={styles.moduleCard}
              onPress={() => navigation.navigate(item.id as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.moduleLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Recent Platform Activity</Text>
            {recentItems.length > 0 ? recentItems.map((ev: any, i: number) => (
                <View key={i} style={styles.eventRow}>
                    <View style={[styles.eventDot, { backgroundColor: ev.type === 'bid' ? BLUE : '#10b981' }]} />
                    <View style={styles.eventContent}>
                        <Text style={styles.eventText}>{ev.text}</Text>
                        <Text style={styles.eventTime}>{ev.time}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
                </View>
            )) : (
              <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>No recent activity to show.</Text>
            )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  welcome: { fontSize: 20, fontWeight: '800', color: DARK },
  subWelcome: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#10b981' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  statusText: { fontSize: 9, fontWeight: '900', color: '#059669' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 16, elevation: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: DARK },
  statLabel: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  statLine: { height: 3, width: 20, borderRadius: 2, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 10 },
  moduleCard: { width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 2 },
  iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  moduleLabel: { fontSize: 12, fontWeight: '700', color: DARK, textAlign: 'center' },
  recentActivity: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DARK, marginBottom: 15 },
  eventRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BLUE, marginRight: 12 },
  eventContent: { flex: 1 },
  eventText: { fontSize: 12, fontWeight: '600', color: DARK },
  eventTime: { fontSize: 10, color: '#94a3b8', marginTop: 2 }
});
