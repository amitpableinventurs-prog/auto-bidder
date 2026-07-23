import { FONTS } from '../theme';

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getFavorites, toggleFavorite, ApiListing } from '../api';
import { useAuth } from '../AuthContext';

const COLORS = {
  bg: "#0a0d14",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#fbbf24",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  red: "#ef4444",
};

export default function Wishlist() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [favorites, setFavorites] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites(user!.id);
      setFavorites(res.favorites || []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId: string) => {
    try {
      await toggleFavorite(user!.id, listingId);
      setFavorites(prev => prev.filter(item => item.id !== listingId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const onSelectCar = (listingId: string) => {
    navigation.navigate('CarDetails', { listingId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => onSelectCar(item.id)}>
              <Image
                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80' }}
                style={styles.image}
              />
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.carTitle} numberOfLines={1}>{item.title}</Text>
                  <Pressable onPress={() => handleRemove(item.id)}>
                    <Ionicons name="heart" size={24} color={COLORS.red} />
                  </Pressable>
                </View>
                <Text style={styles.carMeta}>{item.manufacturingYear} · {item.city} · Verified</Text>
                <Text style={styles.carPrice}><Text style={{ fontFamily: undefined }}>₹</Text> {item.startingBid?.toLocaleString('en-IN') || '0'}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>Your wishlist is empty</Text>
              <Text style={styles.subText}>Save cars you're interested in to track their auctions.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, justifyContent: 'space-between' },
  headerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.poppins.extraBold },
  list: { padding: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  image: { width: '100%', height: 160 },
  info: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', fontFamily: FONTS.poppins.bold },
  carMeta: { color: COLORS.textDim, fontSize: 12, marginTop: 4 },
  carPrice: { color: COLORS.accent, fontSize: 18, fontWeight: '800', marginTop: 8, fontFamily: FONTS.poppins.extraBold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: 20 },
  subText: { color: COLORS.textDim, fontSize: 14, textAlign: 'center', marginTop: 10, paddingHorizontal: 40 }
});
