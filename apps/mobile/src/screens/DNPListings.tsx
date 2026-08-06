import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPListingsScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [selectedShare, setSelectedShare] = useState<any>(null);

  const fetchShares = async () => {
    try {
      const data = await request<any>('/api/dnp/listing-shares');
      setShares(data.shares || []);
    } catch (error) {
      console.error('Fetch Shares Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShares();
  };

  const getStatusColor = (status: string) => {
    const map: any = {
      'SHARED': COLORS.grey,
      'VIEWED': COLORS.accent,
      'INTERESTED': COLORS.primary,
      'CONTACTED': COLORS.secondary,
      'NEGOTIATION': '#f59e0b',
      'CONVERTED': COLORS.green,
      'LOST': COLORS.coral,
    };
    return map[status] || COLORS.grey;
  };

  const renderShareCard = (share: any) => {
    const lead = share.buyerLeads?.[0]; // Current implementation handles one lead per share for simplicity
    return (
      <Pressable key={share.id} style={styles.shareCard} onPress={() => setSelectedShare(share)}>
        <View style={styles.shareHeader}>
          <Image source={{ uri: share.listing?.imageUrl || 'https://via.placeholder.com/150' }} style={styles.carImage} />
          <View style={styles.shareInfo}>
            <Text style={styles.carTitle}>{share.listing?.brand} {share.listing?.model}</Text>
            <Text style={styles.listingId}>Ref: {share.shareToken.substring(0, 8).toUpperCase()}</Text>
            <View style={styles.buyerRow}>
              <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.buyerName}>{lead?.buyerName || 'Prospect Buyer'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead?.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(lead?.status) }]}>{lead?.status}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.shareFooter}>
          <View>
            <Text style={styles.dateLabel}>Shared Date</Text>
            <Text style={styles.dateValue}>{new Date(share.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.dateLabel}>Commission</Text>
            <Text style={[styles.dateValue, { color: COLORS.green }]}>
              {lead?.status === 'CONVERTED' ? 'Earned' : 'Expected'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainDrawer')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Shared Listings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 40 }} />
        ) : shares.length > 0 ? (
          shares.map(renderShareCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="share-social-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>You haven't shared any listings yet.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => navigation.navigate('DNPShareListing')}>
              <Text style={styles.emptyBtnText}>Browse & Share Now</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {selectedShare && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lead Timeline</Text>
              <Pressable onPress={() => setSelectedShare(null)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <View style={styles.detailHeader}>
                <Image source={{ uri: selectedShare.listing?.imageUrl }} style={styles.detailImage} />
                <View>
                  <Text style={styles.detailTitle}>{selectedShare.listing?.brand} {selectedShare.listing?.model}</Text>
                  <Text style={styles.detailSub}>Buyer: {selectedShare.buyerLeads?.[0]?.buyerName}</Text>
                </View>
              </View>

              <View style={styles.timeline}>
                {selectedShare.buyerLeads?.[0]?.statusHistory?.map((event: any, index: number) => (
                  <View key={event.id} style={styles.timelineItem}>
                    <View style={styles.timelinePoint}>
                      <View style={[styles.dot, { backgroundColor: index === 0 ? COLORS.secondary : COLORS.lightGrey1 }]} />
                      {index < selectedShare.buyerLeads[0].statusHistory.length - 1 && <View style={styles.line} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.eventStatus}>{event.status}</Text>
                      <Text style={styles.eventTime}>{new Date(event.createdAt).toLocaleString()}</Text>
                      {event.notes && <Text style={styles.eventNotes}>{event.notes}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  shareCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  shareHeader: { flexDirection: 'row', alignItems: 'center' },
  carImage: { width: 70, height: 50, borderRadius: 10, marginRight: 12 },
  shareInfo: { flex: 1 },
  carTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  listingId: { fontSize: 10, color: COLORS.grey, marginTop: 2 },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  buyerName: { fontSize: 11, color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: FONTS.poppins.bold },
  cardDivider: { height: 1, backgroundColor: COLORS.lightGrey2, marginVertical: 12 },
  shareFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  dateLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  dateValue: { fontSize: 12, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 12, textAlign: 'center' },
  emptyBtn: { marginTop: 20, backgroundColor: COLORS.secondary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 13 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 1000 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey2 },
  modalTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  detailImage: { width: 80, height: 60, borderRadius: 12 },
  detailTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold },
  detailSub: { fontSize: 12, color: COLORS.textMuted },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  timelinePoint: { alignItems: 'center', width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  line: { width: 2, flex: 1, backgroundColor: COLORS.lightGrey1, position: 'absolute', top: 12, bottom: -20 },
  timelineContent: { flex: 1 },
  eventStatus: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  eventTime: { fontSize: 11, color: COLORS.grey, marginTop: 2 },
  eventNotes: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
});
