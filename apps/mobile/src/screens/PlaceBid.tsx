import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ApiListing, placeBid, getListing } from '../api';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { socketService } from '../utils/socket';

import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');

export default function PlaceBid() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceBid'>>();
  const { listingId } = route.params;
  const { user } = useAuth();
  const userId = user?.id;
  const { selectedListing } = useAppStore();

  const [listing, setListing] = useState<ApiListing | null>(
    selectedListing && selectedListing.id === listingId ? selectedListing : null
  );
  const [activeTab, setActiveTab] = useState('bid');
  const [amount, setAmount] = useState(() => {
    if (selectedListing && selectedListing.id === listingId) {
      const currentMax = selectedListing.bids?.[0]?.amount || selectedListing.startingBid || 0;
      return currentMax + 5000;
    }
    return 0;
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!listing);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (listingId) {
      // If we don't have the listing, or even if we do, we might want to refresh the latest bids
      if (!listing) setFetching(true);
      getListing(listingId)
        .then(res => {
          setListing(res.listing);
          const currentMax = res.listing.bids?.[0]?.amount || res.listing.startingBid || 0;
          if (amount === 0 || amount <= currentMax) {
            setAmount(currentMax + 5000);
          }
        })
        .catch(err => console.warn('Fetch listing failed', err))
        .finally(() => setFetching(false));

      socketService.connect();
      socketService.joinListing(listingId);

      socketService.onBidCreated(({ bid }) => {
          setListing(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  bids: [bid, ...(prev.bids || [])].sort((a, b) => b.amount - a.amount)
              };
          });
      });
    }

    return () => {
        if (listingId) {
            socketService.leaveListing(listingId);
            socketService.offBidCreated();
        }
    };
  }, [listingId, userId]);

  const currentMax = listing?.bids?.[0]?.amount || listing?.startingBid || 0;

  const handleQuickIncrease = (inc: number) => {
    setAmount(prev => Math.max(prev, currentMax) + inc);
  };

  const handlePlaceBid = async () => {
    if (!userId) {
        Alert.alert('Required', 'Please login to place a bid');
        return;
    }
    if (!listing) return;

    if (amount <= currentMax) {
        Alert.alert('Invalid Bid', `Bid must be greater than current bid ₹${currentMax.toLocaleString()}`);
        return;
    }

    setLoading(true);
    try {
        await socketService.placeBid(listing.id, userId, amount);
        Alert.alert('Success', 'Congratulations! Your bid has been placed successfully.');
        navigation.goBack();
    } catch (e: any) {
        Alert.alert('Error', e.message);
    } finally {
        setLoading(false);
    }
  };

  if (fetching || !listing) {
    return (
        <View style={[styles.loadingContainer, { backgroundColor: COLORS.white }]}>
            <ActivityIndicator color={COLORS.secondary} size="large" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                <Ionicons name="close" size={26} color={COLORS.black2} />
            </Pressable>
            <Text style={styles.headerTitle}>Review & Bid</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Minimal Car Card */}
            <View style={styles.miniCarCard}>
                <Image
                    source={{ uri: listing.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80' }}
                    style={styles.miniImg}
                />
                <View style={styles.miniInfo}>
                    <Text style={styles.miniTitle} numberOfLines={1}>{listing.title}</Text>
                    <Text style={styles.miniSub}>{listing.manufacturingYear} · {listing.city}</Text>
                </View>
            </View>

<<<<<<< HEAD
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
=======
            {/* Auction Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>CURRENT HIGHEST</Text>
                    <Text style={[styles.statValue, { color: COLORS.secondary }]}><Text style={{ fontFamily: undefined }}>₹</Text>{currentMax.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>TIME REMAINING</Text>
                    <Text style={[styles.statValue, { color: COLORS.coral }]}>04:22:10</Text>
                </View>
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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

<<<<<<< HEAD
        {activeTab === 'bid' ? (
            <View style={styles.bidPanel}>
                <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.amountDisplay}>{offerAmount.toLocaleString('en-IN')}</Text>
                    <View style={styles.editIcon}>
                        <Ionicons name="pencil" size={14} color={COLORS.textMuted} />
=======
            {activeTab === 'bid' ? (
                <View style={styles.bidPanel}>
                    <View style={styles.inputContainer}>
                        {editingAmount ? (
                            <TextInput
                                value={editText}
                                onChangeText={setEditText}
                                keyboardType="numeric"
                                autoFocus
                                style={styles.amountInput}
                                onBlur={() => {
                                    const parsed = parseInt(editText.replace(/,/g, ''), 10);
                                    if (!isNaN(parsed) && parsed > 0) setAmount(parsed);
                                    setEditingAmount(false);
                                }}
                                onSubmitEditing={() => {
                                    const parsed = parseInt(editText.replace(/,/g, ''), 10);
                                    if (!isNaN(parsed) && parsed > 0) setAmount(parsed);
                                    setEditingAmount(false);
                                }}
                            />
                        ) : (
                            <>
                                <Text style={styles.currencySymbol}><Text style={{ fontFamily: undefined }}>₹</Text></Text>
                                <Text style={styles.amountDisplay}>{amount.toLocaleString('en-IN')}</Text>
                                <Pressable style={styles.editIcon} hitSlop={8} onPress={() => { setEditText(amount.toString()); setEditingAmount(true); }}>
                                    <Ionicons name="pencil" size={14} color={COLORS.textMuted} />
                                </Pressable>
                            </>
                        )}
                    </View>

                    <Text style={styles.quickLabel}>Quick Increments</Text>
                    <View style={styles.quickRow}>
                        {[5000, 10000, 25000, 50000].map(inc => (
                            <Pressable key={inc} style={styles.quickBtn} onPress={() => handleQuickIncrease(inc)}>
                                <Text style={styles.quickBtnText}>+<Text style={{ fontFamily: undefined }}>₹</Text>{inc >= 1000 ? (inc/1000)+'k' : inc}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.disclaimer}>
                        <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.disclaimerText}>
                            By placing a bid, you agree to pay the amount if you win the auction. A security deposit may be locked.
                        </Text>
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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
<<<<<<< HEAD
                </ScrollView>
            </View>
        )}
=======
                </View>
            )}
        </ScrollView>
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b

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
<<<<<<< HEAD

        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
        </Pressable>
      </View>
=======
      </KeyboardAvoidingView>
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lightGrey2, borderRadius: 12 },
  headerTitle: { ...TYPOGRAPHY.bodyLarge, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },

  scroll: { padding: 20 },
  miniCarCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGrey2, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  miniImg: { width: 60, height: 60, borderRadius: 14 },
  miniInfo: { marginLeft: 16, flex: 1 },
  miniTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  miniSub: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 2 },

<<<<<<< HEAD
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
=======
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1.5, borderColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1.5, height: '100%', backgroundColor: COLORS.border },
  statLabel: { ...TYPOGRAPHY.bodySmall, fontSize: 12, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 6 },
  statValue: { ...TYPOGRAPHY.bodyLarge, fontFamily: FONTS.poppins.bold },

  tabBar: { flexDirection: 'row', backgroundColor: COLORS.lightGrey2, padding: 6, borderRadius: 16, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.white, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.black2 },

  bidPanel: { },
  inputContainer: {
    backgroundColor: COLORS.lightBlue1,
    borderRadius: 28,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: 24
  },
  currencySymbol: { ...TYPOGRAPHY.h4, color: COLORS.secondary, marginRight: 8 },
  amountDisplay: { ...TYPOGRAPHY.h2, color: COLORS.black2, letterSpacing: -1 },
  editIcon: { marginLeft: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  amountInput: { ...TYPOGRAPHY.h2, color: COLORS.black2, flex: 1, textAlign: 'center', letterSpacing: -1, paddingVertical: 0 },
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b

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
<<<<<<< HEAD
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
=======
    justifyContent: 'space-between'
  },
  totalRow: { flex: 1 },
  totalLabel: { ...TYPOGRAPHY.bodySmall, fontSize: 12, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted, textTransform: 'uppercase' },
  totalValue: { ...TYPOGRAPHY.bodyLarge, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, marginTop: 2 },
  confirmBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 24, height: 50, borderRadius: 5, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 6, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  confirmText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.poppins.bold }
});

>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
