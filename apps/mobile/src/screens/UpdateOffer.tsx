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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ApiListing, getListing, placeBid as placeBidApi } from '../api';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { socketService } from '../utils/socket';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_W } = Dimensions.get('window');

export default function UpdateOffer({ navigation, route }: any) {
  const { listingId } = route.params;
  const { user } = useAuth();
  const userId = user?.id;
  const { selectedListing, setSelectedListing } = useAppStore();

  const [listing, setListing] = useState<ApiListing | null>({
    id: listingId || 'mock-id',
    title: 'Mahindra Thar (2019) - AX (O) D 2WD HT',
    brand: 'Mahindra',
    model: 'Thar',
    manufacturingYear: 2019,
    kilometersDriven: 45459,
    fuelType: 'Diesel',
    transmission: 'Manual',
    demandPrice: 930100,
    startingBid: 850000,
    city: 'Indore',
    imageUrl: 'https://images.unsplash.com/photo-1662557453472-73693e590059?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1662557453472-73693e590059?auto=format&fit=crop&w=800&q=80'],
    status: 'ACTIVE',
    bids: [{ userId: userId || 'mock-user', amount: 890000, createdAt: new Date().toISOString() }]
  } as any);

  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Find user's existing bid
  const myBid = useMemo(() => {
    if (!listing || !userId) return null;
    return listing.bids?.find(b => b.userId === userId);
  }, [listing, userId]);

  const [offerAmount, setOfferAmount] = useState(0);
  const stepRate = 10000; // Mock step rate from image

  useEffect(() => {
    if (listingId) {
      if (!listing) setFetching(true);
      getListing(listingId)
        .then(res => {
          setListing(res.listing);
          const currentMyBid = res.listing.bids?.find(b => b.userId === userId);
          if (currentMyBid) {
            setOfferAmount(currentMyBid.amount + stepRate);
          } else {
            const max = res.listing.bids?.[0]?.amount || res.listing.startingBid || 0;
            setOfferAmount(max + stepRate);
          }
        })
        .catch(err => console.warn('Fetch listing failed', err))
        .finally(() => setFetching(false));

      socketService.connect();
      socketService.joinAuction(listingId);
    }
    return () => {
        if (listingId) socketService.leaveAuction(listingId);
    };
  }, [listingId]);

  const handleAdjust = (type: 'plus' | 'minus') => {
    if (type === 'plus') {
      setOfferAmount(prev => prev + stepRate);
    } else {
      const minPossible = (listing?.bids?.[0]?.amount || listing?.startingBid || 0) + 1000;
      setOfferAmount(prev => Math.max(minPossible, prev - stepRate));
    }
  };

  const handleQuickAdd = (val: number) => {
    setOfferAmount(prev => prev + val);
  };

  const handleSubmit = async () => {
    if (!userId) {
        Alert.alert('Required', 'Please login to submit an offer');
        return;
    }
    if (!listing) return;

    const currentMax = listing.bids?.[0]?.amount || listing.startingBid || 0;
    if (offerAmount <= currentMax) {
        Alert.alert('Invalid Offer', `Offer must be greater than current highest ₹${currentMax.toLocaleString()}`);
        return;
    }

    setSubmitting(true);
    try {
        // Use REST API for reliable submission
        try {
            await placeBidApi(listing.id, userId, offerAmount);
        } catch (apiError: any) {
            console.warn('REST API Bid failed:', apiError);
            console.warn('Error details:', apiError.message);
            // If REST API fails, try socket as backup
            await socketService.placeBid(listing.id, offerAmount);
        }

        Alert.alert('Success', 'Your offer has been updated successfully!');
        navigation.goBack();
    } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to submit offer');
    } finally {
        setSubmitting(false);
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

        <View style={[styles.comparisonCard, myBid && styles.myOfferCard]}>
            <View style={styles.compItem}>
                <Text style={[styles.compLabel, myBid && styles.myOfferLabel]}>{myBid ? 'You offered :-' : 'Starting Bid'}</Text>
                <Text style={[styles.compValue, myBid && styles.myOfferValue]}>₹ {myBid ? myBid.amount.toLocaleString('en-IN') : listing.startingBid.toLocaleString('en-IN')}</Text>
            </View>
            {!myBid && <View style={styles.compDivider} />}
            {!myBid && (
                <View style={styles.compItem}>
                    <Text style={styles.compLabel}>Step Rate</Text>
                    <Text style={styles.compValue}>₹ {stepRate.toLocaleString('en-IN')}</Text>
                </View>
            )}
        </View>

        <Text style={styles.newOfferLabel}>Your New Offer:</Text>

        <View style={styles.adjustRow}>
            <Pressable style={[styles.adjustBtn, { borderColor: '#F87171' }]} onPress={() => handleAdjust('minus')}>
                <MaterialCommunityIcons name="minus" size={24} color="#F87171" />
            </Pressable>
            <Text style={styles.offerDisplay}>₹ {offerAmount.toLocaleString('en-IN')}</Text>
            <Pressable style={[styles.adjustBtn, { borderColor: '#22C55E' }]} onPress={() => handleAdjust('plus')}>
                <MaterialCommunityIcons name="plus" size={24} color="#22C55E" />
            </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.quickRow}>
            {[5000, 10000, 15000].map(val => (
                <Pressable key={val} style={styles.quickBtn} onPress={() => handleQuickAdd(val)}>
                    <Text style={styles.quickBtnText}>+ ₹{val.toLocaleString()}</Text>
                </Pressable>
            ))}
        </View>

        <Pressable
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
        >
            {submitting ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.submitBtnText}>SUBMIT YOUR OFFER AT ₹ {offerAmount.toLocaleString('en-IN')}</Text>
            )}
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

  comparisonCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 24,
    backgroundColor: '#fff'
  },
  myOfferCard: {
    backgroundColor: '#D6F0DB',
    borderColor: '#4CAF50',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 18,
  },
  compItem: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  compDivider: { width: 1, height: '100%', backgroundColor: '#E2E8F0' },
  compLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  myOfferLabel: { fontSize: 24, fontWeight: '600', color: '#1E293B' },
  compValue: { fontSize: 20, fontFamily: FONTS.poppins.bold, color: '#000' },
  myOfferValue: { fontSize: 24, fontWeight: '700', color: '#22C55E' },

  newOfferLabel: {
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    color: '#000',
    marginBottom: 16
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 20
  },
  adjustBtn: {
    width: 48,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  offerDisplay: {
    fontSize: 26,
    fontFamily: FONTS.poppins.bold,
    color: '#000'
  },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    alignItems: 'center'
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000'
  },

  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: FONTS.poppins.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  closeBtn: {
    display: 'none'
  },
  closeBtnText: {
    display: 'none'
  }
});
