import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const MOCK_LISTINGS = [
  {
    id: '1',
    vehicleTitle: '2022 Honda City ZX',
    sellerName: 'Rajesh Kumar',
    sellerPhone: '+91 98765 43210',
    vehicleImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80',
    approvalStatus: 'APPROVED',
    inspectionStatus: 'COMPLETED',
    auctionStatus: 'ACTIVE',
    commission: 12000,
    commissionStatus: 'PENDING',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    vehicleTitle: '2021 Hyundai Creta SX',
    sellerName: 'Priya Patel',
    sellerPhone: '+91 98765 43211',
    vehicleImage: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=400&q=80',
    approvalStatus: 'PENDING',
    inspectionStatus: 'IN_PROGRESS',
    auctionStatus: 'NOT_STARTED',
    commission: 0,
    commissionStatus: 'NOT_APPLICABLE',
    createdAt: '2024-01-18',
  },
  {
    id: '3',
    vehicleTitle: '2023 Maruti Swift VXI',
    sellerName: 'Amit Sharma',
    sellerPhone: '+91 98765 43212',
    vehicleImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=400&q=80',
    approvalStatus: 'APPROVED',
    inspectionStatus: 'COMPLETED',
    auctionStatus: 'SOLD',
    commission: 18000,
    commissionStatus: 'PAID',
    createdAt: '2024-01-10',
  },
];

export default function DNPListingsScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredListings = listings.filter(listing => {
    if (!filterStatus) return true;
    return listing.approvalStatus === filterStatus;
  });

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return COLORS.success;
      case 'PENDING': return COLORS.accent;
      case 'REJECTED': return COLORS.coral;
      default: return COLORS.grey;
    }
  };

  const getCommissionColor = (status: string) => {
    switch (status) {
      case 'PAID': return COLORS.success;
      case 'PENDING': return COLORS.accent;
      case 'NOT_APPLICABLE': return COLORS.grey;
      default: return COLORS.grey;
    }
  };

  const renderListingCard = (listing: any) => (
    <View key={listing.id} style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <Image source={{ uri: listing.vehicleImage }} style={styles.listingImage} />
        <View style={styles.listingInfo}>
          <Text style={styles.vehicleTitle} numberOfLines={2}>{listing.vehicleTitle}</Text>
          <View style={styles.sellerInfo}>
            <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.sellerName}>{listing.sellerName}</Text>
          </View>
          <Text style={styles.createdAt}>Referred: {listing.createdAt}</Text>
        </View>
      </View>

      <View style={styles.statusGrid}>
        <StatusItem
          label="Approval"
          value={listing.approvalStatus}
          color={getApprovalColor(listing.approvalStatus)}
        />
        <StatusItem
          label="Inspection"
          value={listing.inspectionStatus}
          color={listing.inspectionStatus === 'COMPLETED' ? COLORS.success : COLORS.accent}
        />
        <StatusItem
          label="Auction"
          value={listing.auctionStatus}
          color={listing.auctionStatus === 'SOLD' ? COLORS.success : COLORS.secondary}
        />
      </View>

      <View style={styles.commissionSection}>
        <View style={styles.commissionInfo}>
          <Text style={styles.commissionLabel}>Commission</Text>
          <Text style={styles.commissionAmount}>
            {listing.commission > 0 ? `₹${listing.commission.toLocaleString()}` : 'N/A'}
          </Text>
        </View>
        <View style={[styles.commissionBadge, { backgroundColor: getCommissionColor(listing.commissionStatus) + '15' }]}>
          <Text style={[styles.commissionStatusText, { color: getCommissionColor(listing.commissionStatus) }]}>
            {listing.commissionStatus.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.listingActions}>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="eye-outline" size={18} color={COLORS.secondary} />
          <Text style={styles.actionBtnText}>View Details</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="call-outline" size={18} color={COLORS.success} />
          <Text style={styles.actionBtnText}>Call Seller</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>My Listings Brought</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <StatItem label="Total" value={listings.length} color={COLORS.secondary} />
        <StatItem label="Approved" value={listings.filter(l => l.approvalStatus === 'APPROVED').length} color={COLORS.success} />
        <StatItem label="Pending" value={listings.filter(l => l.approvalStatus === 'PENDING').length} color={COLORS.accent} />
        <StatItem label="Sold" value={listings.filter(l => l.auctionStatus === 'SOLD').length} color={COLORS.primary} />
      </View>

      {/* Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <Pressable 
          style={[styles.filterChip, !filterStatus && styles.filterChipActive]}
          onPress={() => setFilterStatus('')}
        >
          <Text style={[styles.filterChipText, !filterStatus && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.filterChip, filterStatus === 'APPROVED' && styles.filterChipActive]}
          onPress={() => setFilterStatus('APPROVED')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'APPROVED' && styles.filterChipTextActive]}>
            Approved
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.filterChip, filterStatus === 'PENDING' && styles.filterChipActive]}
          onPress={() => setFilterStatus('PENDING')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'PENDING' && styles.filterChipTextActive]}>
            Pending
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.filterChip, filterStatus === 'REJECTED' && styles.filterChipActive]}
          onPress={() => setFilterStatus('REJECTED')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'REJECTED' && styles.filterChipTextActive]}>
            Rejected
          </Text>
        </Pressable>
      </ScrollView>

      {/* Listings */}
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredListings.length > 0 ? (
          filteredListings.map(renderListingCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      )}
    </SafeAreaView>
  );
}

function StatusItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={[styles.statusValue, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statusValueText, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: COLORS.lightGrey2,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
  },
  filterChipText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listingHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  listingImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  vehicleTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 6,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerName: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  createdAt: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.grey,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  statusValue: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusValueText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
  },
  commissionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  commissionInfo: {
    flex: 1,
  },
  commissionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  commissionAmount: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  commissionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  commissionStatusText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.lightGrey2,
    gap: 6,
  },
  actionBtnText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
