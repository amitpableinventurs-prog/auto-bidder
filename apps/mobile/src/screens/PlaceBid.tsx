import React, { useState, useEffect, useMemo } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ApiListing, getListing, placeBid as placeBidApi } from '../api';
import { useAuth } from '../AuthContext';
import { COLORS, FONTS, TYPOGRAPHY } from '../theme';
import { socketService } from '../utils/socket';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');

export default function PlaceBid() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceBid'>>();
  const { listingId } = route.params;
  const { user } = useAuth();
  const userId = user?.id;

  const [listing, setListing] = useState<ApiListing | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bid' | 'history'>('bid');
  const [offerAmount, setOfferAmount] = useState(0);
  const stepRate = 10000;

  useEffect(() => {
    if (listingId) {
      setFetching(true);
      getListing(listingId)
        .then(res => {
          setListing(res.listing);
          const currentMyBid = res.listing.bids?.find(b => b.userId === userId);
          const max = res.listing.bids?.[0]?.amount || res.listing.startingBid || 0;
          if (currentMyBid) {
            setOfferAmount(currentMyBid.amount + stepRate);
          } else {
            setOfferAmount(max + stepRate);
          }
        })
        .catch(err => console.warn('Fetch listing failed', err))
        .finally(() => setFetching(false));

      socketService.connect();
      socketService.joinListing(listingId);
    }
    return () => {
        if (listingId) socketService.leaveListing(listingId);
    };
  }, [listingId, userId]);

  const myBid = useMemo(() => {
    if (!listing || !userId) return null;
    return listing.bids?.find(b => b.userId === userId);
  }, [listing, userId]);

  const currentMax = useMemo(() => {
    return listing?.bids?.[0]?.amount || listing?.startingBid || 0;
  }, [listing]);

  const handleAdjust = (type: 'plus' | 'minus') => {
    if (type === 'plus') {
      setOfferAmount(prev => prev + stepRate);
    } else {
      const minPossible = currentMax + 1000;
      setOfferAmount(prev => Math.max(minPossible, prev - stepRate));
    }
  };

  const handleQuickAdd = (val: number) => {
    setOfferAmount(prev => prev + val);
  };

  const handlePlaceBid = async () => {
    if (!userId) {
        Alert.alert('Required', 'Please login to submit an offer');
        return;
    }
    if (!listing) return;

    if (offerAmount <= currentMax) {
        Alert.alert('Invalid Offer', `Offer must be greater than current highest ₹${currentMax.toLocaleString()}`);
        return;
    }

    setLoading(true);
    try {
        try {
            await placeBidApi(listing.id, userId, offerAmount);
        } catch (apiError: any) {
            console.warn('REST API Bid failed, trying socket', apiError);
            await socketService.placeBid(listing.id, userId, offerAmount);
        }

        Alert.alert('Success', 'Your offer has been submitted successfully!');
        navigation.goBack();
    } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to submit offer');
    } finally {
        setLoading(false);
    }
  };

  if (fetching || !listing) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator color={COLORS.secondary} size="large" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{myBid ? 'Update your bid' : 'Submit your bid'}</Text>
            <View style={styles.timerRow}>
                <Ionicons name="time-outline" size={18} color="#000" />
                <Text style={styles.timerText}>Time Left: <Text style={{color: '#FF6F61'}}>11M:20Sec</Text></Text>
            </View>
        </View>

        <View style={styles.carPreview}>
            <Image source={{ uri: listing.imageUrl || listing.images?.[0] }} style={styles.carImage} />
            <View style={styles.carInfo}>
                <Text style={styles.carTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.carSubtitle}>{listing.manufacturingYear} • {listing.kilometersDriven?.toLocaleString()} km • {listing.fuelType}</Text>
                <Text style={styles.askingPrice}>Asking: <Text style={{color: '#22C55E', fontWeight: '700'}}>₹{listing.demandPrice?.toLocaleString()}</Text></Text>
            </View>
        </View>

        {/* Auction Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>CURRENT HIGHEST</Text>
                <Text style={[styles.statValue, { color: COLORS.secondary }]}>₹{currentMax.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>TIME REMAINING</Text>
                <Text style={[styles.statValue, { color: COLORS.coral }]}>04:22:10</Text>
            </View>
        </View>

        <View style={styles.tabBar}>
            <Pressable
                style={[styles.tab, activeTab === 'bid' && styles.tabActive]}
                onPress={() => setActiveTab('bid')}
            >
                <Text style={[styles.tabText, activeTab === 'bid' && styles.tabTextActive]}>Place Bid</Text>
            </Pressable>
            <Pressable
                style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                onPress={() => setActiveTab('history')}
            >
                <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Bid History</Text>
            </Pressable>
        </View>

        {activeTab === 'bid' ? (
            <View style={styles.bidPanel}>
                <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.amountDisplay}>{offerAmount.toLocaleString('en-IN')}</Text>
                    <View style={styles.editIcon}>
                        <Ionicons name="pencil" size={14} color={COLORS.textMuted} />
                    </View>
                </View>

                <Text style={styles.quickLabel}>Quick Increments</Text>
                <View style={styles.quickRow}>
                    {[5000, 10000, 25000, 50000].map(inc => (
                        <Pressable key={inc} style={styles.quickBtn} onPress={() => handleQuickAdd(inc)}>
                            <Text style={styles.quickBtnText}>+₹{inc >= 1000 ? (inc/1000)+'k' : inc}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.disclaimer}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.disclaimerText}>
                        By placing a bid, you agree to pay the amount if you win the auction. A security deposit may be locked.
                    </Text>
                </View>
            </View>
        ) : (
            <View style={styles.historyPanel}>
                <ScrollView style={{maxHeight: 300}}>
                    {(listing.bids || []).map((b: any, i: number) => (
                        <View key={b.id || i} style={styles.historyItem}>
                            <View style={styles.historyAvatar}>
                                <Text style={styles.avatarTxt}>{(b.user?.name?.[0] || 'U').toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.historyName}>{b.user?.name || 'Anonymous'}</Text>
                                <Text style={styles.historyTime}>{i === 0 ? 'Highest Bid' : '2 hours ago'}</Text>
                            </View>
                            <Text style={[styles.historyAmount, i === 0 && { color: COLORS.secondary }]}>₹{b.amount.toLocaleString('en-IN')}</Text>
                        </View>
                    ))}
                    {(!listing.bids || listing.bids.length === 0) && (
                        <View style={styles.emptyHistory}>
                            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
                            <Text style={styles.emptyHistoryText}>No bids placed yet. Be the first!</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        )}

        <View style={styles.footer}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Your Total Bid</Text>
                <Text style={styles.totalValue}>₹{offerAmount.toLocaleString('en-IN')}</Text>
            </View>
            <Pressable
                style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                onPress={handlePlaceBid}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <>
                        <Text style={styles.confirmText}>CONFIRM BID</Text>
                        <MaterialCommunityIcons name="gavel" size={20} color={COLORS.white} />
                    </>
                )}
            </Pressable>
        </View>

        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: FONTS.poppins.bold,
    color: '#000'
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { fontSize: 14, fontWeight: '600', color: '#000' },

  carPreview: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  carImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#CBD5E1'
  },
  carInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2
  },
  carTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  carSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500'
  },
  askingPrice: {
    fontSize: 12,
    color: '#1E293B',
    marginTop: 2
  },

  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '100%', backgroundColor: COLORS.border },
  statLabel: { fontSize: 10, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: FONTS.poppins.bold },

  tabBar: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.secondary },
  tabText: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  tabTextActive: { color: COLORS.secondary, fontFamily: FONTS.poppins.bold },

  bidPanel: { },
  inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  currencySymbol: { fontSize: 24, color: COLORS.secondary, marginRight: 8, fontFamily: FONTS.poppins.bold },
  amountDisplay: { fontSize: 32, color: '#000', fontFamily: FONTS.poppins.bold },
  editIcon: { marginLeft: 10 },

  quickLabel: { fontSize: 12, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted, textAlign: 'center', marginBottom: 12 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, minWidth: (SCREEN_W - 100) / 4 },
  quickBtnText: { color: '#000', fontSize: 12, fontFamily: FONTS.poppins.bold, textAlign: 'center' },

  disclaimer: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  disclaimerText: { flex: 1, fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },

  historyPanel: { },
  historyItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 },
  historyAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarTxt: { color: COLORS.secondary, fontSize: 12, fontFamily: FONTS.poppins.bold },
  historyName: { fontSize: 13, fontFamily: FONTS.poppins.bold, color: '#000' },
  historyTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  historyAmount: { fontSize: 14, fontFamily: FONTS.poppins.bold, color: '#000' },
  emptyHistory: { alignItems: 'center', paddingVertical: 20 },
  emptyHistoryText: { marginTop: 8, fontSize: 12, color: COLORS.textMuted },

  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalRow: { flex: 1 },
  totalLabel: { fontSize: 10, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted, textTransform: 'uppercase' },
  totalValue: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, marginTop: 2 },
  confirmBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 20, height: 44, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmText: { color: '#fff', fontSize: 14, fontFamily: FONTS.poppins.bold },

  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10
  },
  closeBtnText: {
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: '#64748B'
  }
});
