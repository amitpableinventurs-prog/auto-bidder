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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPLeadsScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'VEHICLE' | 'BUYER'>('VEHICLE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleLeads, setVehicleLeads] = useState<any[]>([]);
  const [buyerLeads, setBuyerLeads] = useState<any[]>([]);

  const fetchLeads = async () => {
    try {
      const [vData, bData] = await Promise.all([
        request<any>('/api/dnp/vehicle-leads'),
        request<any>('/api/dnp/listing-shares')
      ]);

      setVehicleLeads(vData.leads || []);
      setBuyerLeads(bData.shares || []);
    } catch (error) {
      console.error('Fetch Leads Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const getStatusColor = (status: string) => {
    const map: any = {
      'SUBMITTED': COLORS.grey,
      'UNDER_REVIEW': COLORS.accent,
      'VERIFIED': COLORS.primary,
      'APPROVED': COLORS.green,
      'LISTING_CREATED': COLORS.secondary,
      'SHARED': COLORS.grey,
      'CONVERTED': COLORS.green,
      'LOST': COLORS.coral,
    };
    return map[status] || COLORS.grey;
  };

  const renderVehicleLead = (lead: any) => (
    <View key={lead.id} style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadIcon}>
          <Ionicons name="car" size={24} color={COLORS.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.leadTitle}>{lead.brand} {lead.model}</Text>
          <Text style={styles.leadSub}>Seller: {lead.sellerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>{lead.status}</Text>
        </View>
      </View>
      <View style={styles.leadMeta}>
        <Text style={styles.metaText}>Submitted: {new Date(lead.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.metaText}>Exp. Price: ₹{lead.expectedPrice.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );

  const renderBuyerLead = (share: any) => {
    const lead = share.buyerLeads?.[0];
    return (
      <View key={share.id} style={styles.leadCard}>
        <View style={styles.leadHeader}>
          <View style={styles.leadIcon}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.leadTitle}>{lead?.buyerName || 'Prospect Buyer'}</Text>
            <Text style={styles.leadSub}>Listing: {share.listing?.brand} {share.listing?.model}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead?.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(lead?.status) }]}>{lead?.status}</Text>
          </View>
        </View>
        <View style={styles.leadMeta}>
          <Text style={styles.metaText}>Shared: {new Date(share.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.metaText}>Buyer Phone: {lead?.buyerPhone?.substring(0, 6)}XXXX</Text>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>My Leads</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'VEHICLE' && styles.activeTab]}
          onPress={() => setActiveTab('VEHICLE')}
        >
          <Text style={[styles.tabText, activeTab === 'VEHICLE' && styles.activeTabText]}>Vehicle Leads</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'BUYER' && styles.activeTab]}
          onPress={() => setActiveTab('BUYER')}
        >
          <Text style={[styles.tabText, activeTab === 'BUYER' && styles.activeTabText]}>Buyer Leads</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 40 }} />
        ) : (
          activeTab === 'VEHICLE' ? (
            vehicleLeads.length > 0 ? vehicleLeads.map(renderVehicleLead) : (
              <EmptyLeads icon="car-sport-outline" text="No vehicle leads submitted yet." />
            )
          ) : (
            buyerLeads.length > 0 ? buyerLeads.map(renderBuyerLead) : (
              <EmptyLeads icon="people-outline" text="No buyer leads generated yet." />
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyLeads({ icon, text }: { icon: any, text: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={60} color={COLORS.lightGrey1} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
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
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 20, paddingBottom: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: COLORS.secondary },
  tabText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, fontFamily: FONTS.poppins.bold },
  activeTabText: { color: COLORS.secondary },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  leadCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  leadHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leadIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  leadTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  leadSub: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: FONTS.poppins.bold, textTransform: 'uppercase' },
  leadMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  metaText: { fontSize: 11, color: COLORS.grey },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 12 },
});
