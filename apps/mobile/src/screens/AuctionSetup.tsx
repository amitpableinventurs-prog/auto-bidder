import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../AuthContext';
import * as api from '../api';

import { COLORS } from '../theme';
const BLUE = COLORS.secondary;
const DARK = '#0f172a';

export default function AuctionSetup() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AuctionSetup'>>();
  const { listingData } = (route.params as any) || {};
  const { user } = useAuth();
  const isDealer = user?.userType === 'DEALER';

  const [basePrice, setBasePrice] = useState(listingData?.demandPrice ? Math.floor(listingData.demandPrice * 0.9).toString() : '4,50,000');
  const [sellingTimeline, setSellingTimeline] = useState('7 days');
  const [commission, setCommission] = useState('2%');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('en-IN');
  };

  const handleBasePriceChange = (val: string) => {
    setBasePrice(formatCurrency(val));
  };

  const handleLaunch = async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in to submit a listing');

    setLoading(true);
    try {
        const payload = {
            ...listingData,
            startingBid: parseInt(basePrice.replace(/,/g, '')),
            sellingTimeline,
            status: 'PENDING_INSPECTION'
        };

        if (listingData?.id) {
            await api.updateListing(listingData.id, payload);
            Alert.alert(
                'Success',
                'Your car listing has been updated successfully.',
                [{ text: 'OK', onPress: () => navigation.navigate('MainDrawer' as any) }]
            );
        } else {
            await api.createListing(user.id, payload);
            Alert.alert(
                'Success',
                'Your car has been submitted for approval. Our team will verify the details soon.',
                [{ text: 'OK', onPress: () => navigation.navigate('MainDrawer' as any) }]
            );
        }
    } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to submit listing');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <View>
            <Text style={styles.headerTitle}>Auction Setup</Text>
            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '700', marginTop: 2 }}>STEP 5 OF 5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.carSummary}>
            <Ionicons name="car-sport" size={40} color={BLUE} />
            <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.carName}>{listingData?.title || 'Volkswagen Polo GT Tsi'}</Text>
                <Text style={styles.carMeta}>{listingData?.manufacturingYear || '2021'} • {listingData?.transmission || 'Manual'} • {listingData?.color || 'White'}</Text>
            </View>
        </View>

        <Text style={styles.sectionLabel}>MINIMUM STARTING BID</Text>
        <View style={styles.inputBox}>
          <Text style={styles.currency}><Text style={{ fontFamily: undefined }}>₹</Text></Text>
          <TextInput
            value={basePrice}
            onChangeText={handleBasePriceChange}
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <Text style={styles.hint}>
          However system will re-set up according to previous business data and local market scenarios
        </Text>

        <Text style={styles.sectionLabel}>SELLING TIMELINE</Text>
        <View style={styles.grid}>
          {['Cashmycar instant', '7 days', '15 days', '30 days', '2-3 month', 'Exchange with Used Car', 'Exchange with New Car'].map(t => (
            <Pressable
              key={t}
              style={[styles.chip, sellingTimeline === t && styles.chipActive]}
              onPress={() => setSellingTimeline(t)}
            >
              <Text style={[styles.chipText, sellingTimeline === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {isDealer && (
            <>
                <Text style={styles.sectionLabel}>DEALER COMMISSION RATE</Text>
                <View style={styles.grid}>
                {['1%', '2%', '3%', '5%'].map(c => (
                    <Pressable
                        key={c}
                        style={[styles.chip, commission === c && styles.chipActive]}
                        onPress={() => setCommission(c)}
                    >
                        <Text style={[styles.chipText, commission === c && styles.chipTextActive]}>{c}</Text>
                    </Pressable>
                ))}
                </View>
            </>
        )}

        <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#f59e0b" />
            <Text style={styles.infoText}>
                Your auction will start once approved by our inspectors.
                Average approval time is 2-4 hours.
            </Text>
        </View>

        {(!listingData?.images || listingData.images.length === 0 || !listingData?.rcImages || listingData.rcImages.length === 0) && (
            <View style={[styles.infoCard, { backgroundColor: '#eff6ff', marginTop: 15 }]}>
                <Ionicons name="bulb-outline" size={24} color="#3b82f6" />
                <Text style={[styles.infoText, { color: '#1e40af' }]}>
                    <Text style={{ fontWeight: 'bold' }}>Tip:</Text> Adding clear car photos and complete RC details can help you get up to 40% higher bids. You can add them later from "Manage Inventory".
                </Text>
            </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
            style={[styles.launchBtn, { backgroundColor: '#007bff' }, loading && { opacity: 0.7 }]}
            onPress={handleLaunch}
            disabled={loading}
        >
          {loading ? (
              <ActivityIndicator color="#fff" />
          ) : (
              <>
                <Text style={styles.launchBtnText}>SUBMIT</Text>
                <MaterialCommunityIcons name="send" size={22} color="#fff" />
              </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  content: { padding: 20 },
  carSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 30 },
  carName: { fontSize: 16, fontWeight: '700', color: DARK },
  carMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: BLUE, paddingVertical: 10, marginBottom: 8 },
  currency: { fontSize: 24, fontWeight: '800', color: DARK, marginRight: 10 },
  input: { fontSize: 24, fontWeight: '800', color: DARK, flex: 1 },
  hint: { fontSize: 12, color: '#64748b', marginBottom: 30, fontStyle: 'italic', lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: BLUE, borderColor: BLUE },
  chipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#fff' },
  infoCard: { flexDirection: 'row', backgroundColor: '#fffbeb', padding: 15, borderRadius: 12, gap: 12, marginTop: 10 },
  infoText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 40 },
  launchBtn: { backgroundColor: BLUE, height: 50, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  launchBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 }
});
