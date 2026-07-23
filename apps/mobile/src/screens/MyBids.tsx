import { FONTS } from '../theme';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getUserBids } from '../api';
import { useAuth } from '../AuthContext';

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

export default function MyBids() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
        setLoading(false);
        return;
    }
    getUserBids(user.id)
      .then(res => setBids(res.bids))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const getStatusConfig = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'ACCEPTED': return { color: COLORS.green, icon: 'checkmark-circle' };
      case 'REJECTED': return { color: COLORS.red, icon: 'close-circle' };
      case 'OUTBID': return { color: COLORS.accent, icon: 'arrow-up-circle' };
      default: return { color: COLORS.blue, icon: 'time' };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Bidding Activity</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
            <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.accent} size="large" />
                <Text style={styles.loadingText}>Syncing your bids...</Text>
            </View>
        ) : bids.map(bid => {
          const config = getStatusConfig(bid.status);
          return (
            <View key={bid.id} style={styles.card}>
              <Image
                source={{ uri: bid.listing?.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=300&q=80' }}
                style={styles.img}
              />
              <View style={styles.info}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title} numberOfLines={1}>{bid.listing?.title || 'Unknown Vehicle'}</Text>
                    <View style={styles.amountWrap}>
                        <Text style={styles.bidLabel}>YOUR BID</Text>
                        <Text style={styles.bidAmount}><Text style={{ fontFamily: undefined }}>₹</Text>{(bid.amount ?? 0).toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                <View style={styles.statusRow}>
                    <View style={[styles.badge, { backgroundColor: config.color + '15' }]}>
                        <Ionicons name={config.icon as any} size={12} color={config.color} />
                        <Text style={[styles.badgeText, { color: config.color }]}>{bid.status}</Text>
                    </View>
                    <Text style={styles.date}>{new Date(bid.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {!loading && bids.length === 0 && (
            <View style={styles.empty}>
                <View style={styles.emptyIconBox}>
                    <Ionicons name="hammer-outline" size={60} color={COLORS.surface2} />
                </View>
                <Text style={styles.emptyText}>No bids placed yet</Text>
                <Text style={styles.emptySub}>Start bidding on your favorite cars to see them here.</Text>
                <Pressable style={styles.browseBtn} onPress={() => navigation.navigate('MainDrawer')}>
                    <Text style={styles.browseText}>BROWSE AUCTIONS</Text>
                </Pressable>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.poppins.extraBold },

  content: { padding: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, overflow: 'hidden', marginBottom: 16, flexDirection: 'row', borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  img: { width: 100, height: 100, borderRadius: 18 },
  info: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8, fontFamily: FONTS.poppins.bold },
  amountWrap: { alignItems: 'flex-end' },
  bidLabel: { fontSize: 12, color: COLORS.textDim, fontWeight: '800', letterSpacing: 0.5, fontFamily: FONTS.poppins.extraBold },
  bidAmount: { fontSize: 16, fontWeight: '900', color: COLORS.accent, marginTop: 2, fontFamily: FONTS.poppins.black },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', fontFamily: FONTS.poppins.extraBold },
  date: { fontSize: 12, color: COLORS.textDim, fontFamily: FONTS.poppins.medium },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  loadingText: { color: COLORS.textDim, marginTop: 12, fontSize: 14, fontFamily: FONTS.poppins.medium },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: 20, color: COLORS.text, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },
  emptySub: { fontSize: 14, color: COLORS.textDim, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20, fontFamily: FONTS.poppins.regular },
  browseBtn: { marginTop: 32, backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 5 },
  browseText: { color: '#000', fontWeight: '900', fontSize: 14, fontFamily: FONTS.poppins.black }
});
