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
import { getUserPayments } from '../api';
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
  green: "#22c55e",
};

export default function PurchaseHistory() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }
    getUserPayments(userId)
      .then(res => setPayments(res.payments))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
            <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.accent} size="large" />
                <Text style={styles.loadingText}>Fetching your orders...</Text>
            </View>
        ) : payments.map(p => (
          <View key={p.id} style={styles.card}>
            <Image source={{ uri: p.listing?.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=300&q=80' }} style={styles.img} />
            <View style={styles.info}>
              <View style={styles.cardHeader}>
                  <Text style={styles.title} numberOfLines={1}>{p.listing?.title || 'Unknown Vehicle'}</Text>
                  <Text style={styles.price}><Text style={{ fontFamily: undefined }}>₹</Text>{p.amount.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.statusRow}>
                  <View style={styles.badge}>
                      <Ionicons name="checkmark-circle" size={12} color={COLORS.green} />
                      <Text style={styles.badgeText}>{p.status}</Text>
                  </View>
                  <Text style={styles.date}>{new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              </View>
              <View style={styles.idRow}>
                  <Text style={styles.idText}>ID: {p.id.slice(-8).toUpperCase()}</Text>
                  <Pressable><Text style={styles.invoiceText}>INVOICE</Text></Pressable>
              </View>
            </View>
          </View>
        ))}

        {!loading && payments.length === 0 && (
            <View style={styles.empty}>
                <View style={styles.emptyIconBox}>
                    <Ionicons name="receipt-outline" size={60} color={COLORS.surface2} />
                </View>
                <Text style={styles.emptyText}>No purchases yet</Text>
                <Text style={styles.emptySub}>Your successful vehicle acquisitions will appear here.</Text>
                <Pressable style={styles.browseBtn} onPress={() => navigation.navigate('MainDrawer')}>
                    <Text style={styles.browseText}>EXPLORE AUCTIONS</Text>
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
  img: { width: 90, height: 90, borderRadius: 16 },
  info: { flex: 1, paddingLeft: 16, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8, fontFamily: FONTS.poppins.bold },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.accent, fontFamily: FONTS.poppins.extraBold },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.green + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '800', color: COLORS.green, textTransform: 'uppercase', fontFamily: FONTS.poppins.extraBold },
  date: { fontSize: 12, color: COLORS.textDim, fontFamily: FONTS.poppins.medium },

  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  idText: { fontSize: 12, color: COLORS.textDim, fontFamily: FONTS.poppins.semiBold },
  invoiceText: { fontSize: 12, color: COLORS.blue, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  loadingText: { color: COLORS.textDim, marginTop: 12, fontSize: 14, fontFamily: FONTS.poppins.medium },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: 20, color: COLORS.text, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },
  emptySub: { fontSize: 14, color: COLORS.textDim, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20, fontFamily: FONTS.poppins.regular },
  browseBtn: { marginTop: 32, backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 5 },
  browseText: { color: '#000', fontWeight: '900', fontSize: 14, fontFamily: FONTS.poppins.black }
});
