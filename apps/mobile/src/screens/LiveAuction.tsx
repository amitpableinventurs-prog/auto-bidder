import { FONTS } from '../theme';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');

const COLORS = {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  surface2: "#F1F5F9",
  border: "#E2E8F0",
  accent: "#FFC107",
  blue: "#2563EB",
  text: "#1E293B",
  textMuted: "#64748B",
  textDim: "#94A3B8",
  red: "#EF4444",
  green: "#10B981",
};

import { ApiListing, getListing, setupAutoBid } from '../api';
import AutoBidModal from './AutoBidModal';
import { useAuth } from '../AuthContext';
import { socketService } from '../utils/socket';
import { useAppStore } from '../store/useAppStore';

export default function LiveAuction() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LiveAuction'>>();
  const { listingId } = route.params;
  const { user } = useAuth();
  const { selectedListing } = useAppStore();
  const insets = useSafeAreaInsets();

  const [listing, setListing] = useState<ApiListing | null>(
    selectedListing && selectedListing.id === listingId ? selectedListing : null
  );
  const [timeLeft, setTimeLeft] = useState(120);
  const [showAutoBid, setShowAutoBid] = useState(false);
  const [autoBidLimit, setAutoBidLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(!listing);

  useEffect(() => {
    if (listingId) {
      fetchListing(!listing);

      // Connect to socket and join listing room
      socketService.connect();
      socketService.joinListing(listingId);

      // Listen for real-time bids
      socketService.onBidCreated(({ bid }) => {
        if (!bid || !bid.id || bid.amount === undefined) return;

        setListing(prev => {
          if (!prev) return null;
          // Update bids list if not already present
          const exists = prev.bids?.some(b => b.id === bid.id);
          if (exists) return prev;

          const updatedBids = [bid, ...(prev.bids || [])].sort((a, b) => (b.amount || 0) - (a.amount || 0));
          return {
            ...prev,
            bids: updatedBids
          };
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      });
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
        clearInterval(timer);
        if (listingId) {
          socketService.leaveListing(listingId);
          socketService.offBidCreated();
        }
    };
  }, [listingId]);

  const fetchListing = (showLoading = true) => {
    if (showLoading) setLoading(true);
    getListing(listingId)
      .then(res => setListing(res.listing))
      .catch(err => console.warn('Fetch listing failed', err))
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  const bids = (listing?.bids || []).map(b => ({
    id: b.id,
    user: b.user?.name || 'User',
    amount: (b.amount ?? 0).toLocaleString(),
    time: 'Recent',
  }));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEnableAutoBid = async (max: number) => {
    if (!user?.id) {
      alert('Please login to enable auto bidding');
      return;
    }
    try {
      await setupAutoBid(user.id, listingId, max);
      setAutoBidLimit(max);
      setShowAutoBid(false);
      alert(`Auto Bid enabled up to ₹${max.toLocaleString()}`);
    } catch (err: any) {
      alert(err.message || 'Failed to enable auto bid');
    }
  };

  if (loading || !listing) {
      return (
          <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color={COLORS.accent} size="large" />
          </View>
      );
  }

  return (
    <View style={styles.safe}>
      <StatusBar style="dark" />

      <View style={[styles.header, {
        paddingTop: insets.top,
        paddingLeft: Math.max(insets.left, 20),
        paddingRight: Math.max(insets.right, 20)
      }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Live Auction</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.miniCard}>
          <Image
            source={{ uri: listing.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80' }}
            style={styles.miniImg}
          />
          <View style={styles.miniInfo}>
            <Text style={styles.miniName}>{listing.title}</Text>
            <Text style={styles.miniMeta}>{listing.transmission} • {listing.fuelType} • {listing.city}</Text>
          </View>
        </View>

        <View style={styles.mainDisplay}>
          <Text style={styles.timerLabel}>AUCTION ENDS IN</Text>
          <View style={styles.timerBox}>
             <Text style={[styles.timerValue, timeLeft < 30 && { color: COLORS.red }]}>{formatTime(timeLeft)}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.bidLabel}>CURRENT HIGHEST BID</Text>
            <Text style={styles.bidValue}><Text style={{ fontFamily: undefined }}>₹</Text> {(listing.bids?.[0]?.amount || listing.startingBid).toLocaleString('en-IN')}</Text>
            <View style={styles.bidderBadge}>
               <Ionicons name="person" size={12} color={COLORS.green} />
               <Text style={styles.bidderName}>{listing.bids?.[0]?.user?.name || 'Waiting for bids'}</Text>
            </View>
            {!!autoBidLimit && (
              <View style={[styles.bidderBadge, { backgroundColor: COLORS.accent + '15', marginTop: 15 }]}>
                <Ionicons name="flash" size={12} color={COLORS.accent} />
                <Text style={[styles.bidderName, { color: COLORS.accent }]}>Auto Bid Active: <Text style={{ fontFamily: undefined }}>₹</Text> {autoBidLimit.toLocaleString()}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
             <Text style={styles.sectionTitle}>Bidding History</Text>
             <View style={styles.bidCount}><Text style={styles.bidCountText}>{bids.length} BIDS</Text></View>
          </View>

          {bids.length === 0 ? (
            <View style={styles.emptyBids}>
               <Ionicons name="hammer-outline" size={48} color={COLORS.surface2} />
               <Text style={styles.emptyText}>Be the first one to bid!</Text>
            </View>
          ) : (
            bids.map((bid, i) => (
              <View key={bid.id} style={[styles.bidRow, i === 0 && styles.topBidRow]}>
                <View style={styles.bidderInfo}>
                  <View style={[styles.avatar, { backgroundColor: i === 0 ? COLORS.accent : COLORS.surface2 }]}>
                    <Text style={[styles.avatarText, { color: i === 0 ? '#000' : COLORS.text }]}>{bid.user[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.bidderNameText, i === 0 && { color: COLORS.accent }]}>{bid.user} {i === 0 && '👑'}</Text>
                    <Text style={styles.bidTimeText}>{bid.time}</Text>
                  </View>
                </View>
                <Text style={[styles.bidAmountText, i === 0 && { color: COLORS.accent }]}><Text style={{ fontFamily: undefined }}>₹</Text> {bid.amount}</Text>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, {
        paddingBottom: Math.max(insets.bottom, 20),
        paddingLeft: Math.max(insets.left, 20),
        paddingRight: Math.max(insets.right, 20)
      }]}>
        <Pressable
          style={[styles.autoBtn, autoBidLimit ? { backgroundColor: COLORS.accent } : {}]}
          onPress={() => setShowAutoBid(true)}
        >
          <Ionicons name="flash" size={24} color={autoBidLimit ? "#000" : COLORS.accent} />
          <Text style={[styles.autoText, autoBidLimit ? { color: "#000" } : {}]}>{autoBidLimit ? 'LIMIT' : 'AUTO'}</Text>
        </Pressable>
        <Pressable style={styles.bidNowBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          navigation.navigate('PlaceBid', { listingId: listing.id });
        }}>
          <View>
            <Text style={styles.bidNowText}>PLACE BID</Text>
            <Text style={styles.bidNext}>Next: +<Text style={{ fontFamily: undefined }}>₹</Text>2,000</Text>
          </View>
          <Ionicons name="hammer" size={24} color="#000" />
        </Pressable>
      </View>

      {showAutoBid && (
        <View style={StyleSheet.absoluteFill}>
          <AutoBidModal
            currentBid={listing.bids?.[0]?.amount || listing.startingBid}
            onClose={() => setShowAutoBid(false)}
            onEnable={handleEnableAutoBid}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 20, justifyContent: 'space-between' },
  headerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.red + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.red, marginRight: 6 },
  liveText: { color: COLORS.red, fontSize: 12, fontWeight: '900', fontFamily: FONTS.poppins.black },

  miniCard: { flexDirection: 'row', backgroundColor: COLORS.surface, margin: 20, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  miniImg: { width: 50, height: 50, borderRadius: 10 },
  miniInfo: { marginLeft: 12 },
  miniName: { color: COLORS.text, fontSize: 16, fontWeight: '700', fontFamily: FONTS.poppins.bold },
  miniMeta: { color: COLORS.textDim, fontSize: 12, marginTop: 2, fontFamily: FONTS.poppins.medium },

  mainDisplay: { alignItems: 'center', paddingVertical: 20 },
  timerLabel: { color: COLORS.textDim, fontSize: 12, letterSpacing: 2, fontWeight: '700', fontFamily: FONTS.poppins.bold },
  timerBox: { marginVertical: 10, paddingHorizontal: 20, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.surface2 },
  timerValue: { color: COLORS.text, fontSize: 30, fontWeight: '900', fontFamily: FONTS.poppins.black },

  priceContainer: { marginTop: 20, alignItems: 'center', width: '100%' },
  bidLabel: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, fontFamily: FONTS.poppins.extraBold },
  bidValue: { color: COLORS.text, fontSize: 30, fontWeight: '900', marginTop: 4, fontFamily: FONTS.poppins.black },
  bidderBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.green + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  bidderName: { color: COLORS.green, fontSize: 12, fontWeight: '700', fontFamily: FONTS.poppins.bold },

  historySection: { flex: 1, backgroundColor: COLORS.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, marginTop: 30, minHeight: 400, borderWidth: 1, borderColor: COLORS.border },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.poppins.extraBold },
  bidCount: { backgroundColor: COLORS.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bidCountText: { color: COLORS.textDim, fontSize: 12, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },

  bidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  topBidRow: { backgroundColor: COLORS.accent + '05', marginHorizontal: -24, paddingHorizontal: 24 },
  bidderInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: '800', fontSize: 16, fontFamily: FONTS.poppins.extraBold },
  bidderNameText: { fontSize: 14, fontWeight: '700', color: COLORS.text, fontFamily: FONTS.poppins.bold },
  bidTimeText: { fontSize: 12, color: COLORS.textDim, marginTop: 2, fontFamily: FONTS.poppins.medium },
  bidAmountText: { fontSize: 16, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.poppins.extraBold },

  emptyBids: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, opacity: 0.5 },
  emptyText: { color: COLORS.textDim, marginTop: 16, fontFamily: FONTS.poppins.medium },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: 40, backgroundColor: COLORS.surface, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  autoBtn: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface2 },
  autoText: { fontSize: 12, fontWeight: '900', color: COLORS.accent, marginTop: 2, fontFamily: FONTS.poppins.black },
  bidNowBtn: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  bidNowText: { color: '#000', fontSize: 16, fontWeight: '900', fontFamily: FONTS.poppins.black },
  bidNext: { color: 'rgba(0,0,0,0.5)', fontSize: 12, fontWeight: '700', fontFamily: FONTS.poppins.bold }
});
