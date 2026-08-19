import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ApiListing, getListings, updateListingStatus, getListingActivities } from '../../api';
import ListingTimeline from '../../components/admin/ListingTimeline';

const DARK = '#0f172a';
const LIGHT = '#f8fafc';
const BLUE = '#2563eb';

export default function AdminVehicleVerification() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ApiListing | null>(null);

  const fetchListings = () => {
    setLoading(true);
    getListings({ status: 'PENDING_INSPECTION' })
      .then(res => setListings(res.listings))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  };

  const fetchActivities = (listing: ApiListing) => {
    setSelectedListing(listing);
    getListingActivities(listing.id)
      .then(res => {
        setActivities(res.activities);
        setShowTimeline(true);
      })
      .catch(err => console.warn(err));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleStatus = (id: string, status: string) => {
    updateListingStatus(id, status)
        .then(() => fetchListings())
        .catch(err => console.warn(err));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Vehicle Verification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={DARK} style={{ marginTop: 20 }} />
        ) : listings.map(item => (
          <View key={item.id} style={styles.card}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.img} />}
            <View style={styles.badge}><Text style={styles.badgeText}>{item.status}</Text></View>

            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>New</Text>
              </View>
              <Text style={styles.plate}>{item.plateNumber || 'No Plate'}</Text>
              <Text style={styles.seller}>Listed by: <Text style={{ fontWeight: '700' }}>{item.seller?.name || 'Anonymous'}</Text></Text>

              <Pressable style={styles.timelineBtn} onPress={() => fetchActivities(item)}>
                <Ionicons name="time-outline" size={14} color={BLUE} />
                <Text style={styles.timelineBtnText}>View Listing History</Text>
              </Pressable>

              <View style={styles.divider} />

              <View style={styles.actionRow}>
                <Pressable style={styles.detailsBtn} onPress={() => handleStatus(item.id, 'REJECTED')}>
                    <Text style={[styles.detailsText, { color: '#ef4444' }]}>Reject</Text>
                </Pressable>
                <Pressable style={styles.assignBtn} onPress={() => handleStatus(item.id, 'ACTIVE')}>
                    <Text style={styles.assignText}>Approve & Go Live</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        {!loading && listings.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8' }}>
            No vehicles pending inspection.
          </Text>
        )}
      </ScrollView>

      <Modal visible={showTimeline} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Listing Timeline</Text>
                {selectedListing && (
                  <Text style={styles.modalSubtitle}>{selectedListing.title}</Text>
                )}
              </View>
              <Pressable onPress={() => setShowTimeline(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={DARK} />
              </Pressable>
            </View>
            <ListingTimeline activities={activities} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 3 },
  img: { width: '100%', height: 160 },
  badge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  info: { padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: DARK },
  time: { fontSize: 10, color: '#94a3b8' },
  plate: { fontSize: 12, color: BLUE, fontWeight: '800', marginTop: 4 },
  seller: { fontSize: 12, color: '#64748b', marginTop: 4 },
  timelineBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 },
  timelineBtnText: { fontSize: 12, color: BLUE, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  actionRow: { flexDirection: 'row', gap: 10 },
  detailsBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  detailsText: { color: DARK, fontSize: 13, fontWeight: '700' },
  assignBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  assignText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: DARK },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
});
