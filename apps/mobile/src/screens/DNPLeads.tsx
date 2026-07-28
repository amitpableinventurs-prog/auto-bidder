import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const LEAD_STATUS = [
  { value: 'SHARED', label: 'Shared', color: COLORS.secondary },
  { value: 'VIEWED', label: 'Viewed', color: COLORS.primary },
  { value: 'CONTACTED', label: 'Contacted', color: COLORS.accent },
  { value: 'TEST_DRIVE_SCHEDULED', label: 'Test Drive', color: '#8b5cf6' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: '#f59e0b' },
  { value: 'BOOKING', label: 'Booking', color: '#06b6d4' },
  { value: 'SOLD', label: 'Sold', color: COLORS.success },
  { value: 'CLOSED', label: 'Closed', color: COLORS.grey },
  { value: 'LOST', label: 'Lost', color: COLORS.coral },
];

const MOCK_LEADS = [
  {
    id: '1',
    buyerName: 'Rahul Sharma',
    buyerPhone: '+91 98765 43210',
    vehicleTitle: '2022 Honda City ZX',
    vehicleImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80',
    status: 'CONTACTED',
    lastActivity: '2 hours ago',
    expectedCommission: 12000,
    notes: 'Interested in test drive',
  },
  {
    id: '2',
    buyerName: 'Priya Patel',
    buyerPhone: '+91 98765 43211',
    vehicleTitle: '2021 Hyundai Creta SX',
    vehicleImage: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=400&q=80',
    status: 'NEGOTIATION',
    lastActivity: '1 day ago',
    expectedCommission: 18000,
    notes: 'Negotiating on price',
  },
  {
    id: '3',
    buyerName: 'Amit Kumar',
    buyerPhone: '+91 98765 43212',
    vehicleTitle: '2023 Maruti Swift VXI',
    vehicleImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=400&q=80',
    status: 'VIEWED',
    lastActivity: '3 days ago',
    expectedCommission: 8000,
    notes: 'Viewed listing',
  },
];

export default function DNPLeadsScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url = new URL(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/leads`);
      if (filterStatus) url.searchParams.append('status', filterStatus);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Fetch Leads Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filterStatus]);

  const filteredLeads = leads.filter(lead => {
    const buyerName = lead.buyerName || '';
    const vehicleTitle = lead.sharedListing?.listing?.title || '';

    return !searchQuery ||
      buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicleTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStatusUpdate = async (leadId: string, newStatus: string, notes?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
        setShowStatusModal(false);
        Alert.alert('Success', 'Lead status updated successfully');
      } else {
        Alert.alert('Error', data.error || 'Failed to update lead status');
      }
    } catch (error) {
      console.error('Status Update Error:', error);
      Alert.alert('Error', 'Failed to update lead status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = LEAD_STATUS.find(s => s.value === status);
    return statusConfig?.color || COLORS.grey;
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = LEAD_STATUS.find(s => s.value === status);
    return statusConfig?.label || status;
  };

  const renderLeadCard = (lead: any) => (
    <Pressable 
      key={lead.id} 
      style={styles.leadCard}
      onPress={() => {
        setSelectedLead(lead);
        setShowStatusModal(true);
      }}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={styles.buyerName}>{lead.buyerName || 'Unnamed Buyer'}</Text>
          <Text style={styles.buyerPhone}>{lead.buyerPhone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>
            {getStatusLabel(lead.status)}
          </Text>
        </View>
      </View>

      <View style={styles.leadVehicle}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>{lead.sharedListing?.listing?.title}</Text>
          <Text style={styles.lastActivity}>Created: {new Date(lead.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.commission}>
          {lead.actualCommission > 0 ? `Earned: ₹${lead.actualCommission.toLocaleString()}` : `Expected: ₹${lead.expectedCommission.toLocaleString()}`}
        </Text>
      </View>

      {lead.notes && (
        <View style={styles.leadNotes}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.notesText}>{lead.notes}</Text>
        </View>
      )}

      <View style={styles.leadActions}>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="call" size={18} color={COLORS.success} />
          <Text style={styles.actionBtnText}>Call</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="chatbubble" size={18} color={COLORS.secondary} />
          <Text style={styles.actionBtnText}>Chat</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Update</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Buyer Leads</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          placeholderTextColor={COLORS.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Filter */}
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
        {LEAD_STATUS.map(status => (
          <Pressable
            key={status.value}
            style={[styles.filterChip, filterStatus === status.value && styles.filterChipActive]}
            onPress={() => setFilterStatus(status.value)}
          >
            <Text style={[styles.filterChipText, filterStatus === status.value && styles.filterChipTextActive]}>
              {status.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Leads List */}
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLeads.length > 0 ? (
          filteredLeads.map(renderLeadCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No leads found</Text>
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      {showStatusModal && selectedLead && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Lead Status</Text>
              <Pressable onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>

            <View style={styles.leadDetail}>
              <Text style={styles.leadDetailName}>{selectedLead.buyerName}</Text>
              <Text style={styles.leadDetailVehicle}>{selectedLead.sharedListing?.listing?.title}</Text>
              <Text style={styles.leadDetailCurrent}>
                Current Status: <Text style={{ color: getStatusColor(selectedLead.status) }}>
                  {getStatusLabel(selectedLead.status)}
                </Text>
              </Text>
            </View>

            <Text style={styles.modalSectionTitle}>Select New Status</Text>
            <View style={styles.statusGrid}>
              {LEAD_STATUS.map(status => (
                <Pressable
                  key={status.value}
                  style={[
                    styles.statusOption,
                    { borderColor: status.color },
                  ]}
                  onPress={() => handleStatusUpdate(selectedLead.id, status.value)}
                >
                  <View style={[styles.statusOptionDot, { backgroundColor: status.color }]} />
                  <Text style={styles.statusOptionText}>{status.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalInfo}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent} />
              <Text style={styles.modalInfoText}>
                Updating lead status helps track the progress of potential buyers. Commissions are calculated based on final sale status.
              </Text>
            </View>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      )}
    </SafeAreaView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    margin: 20,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.black2,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  leadCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  buyerName: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  buyerPhone: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
  },
  leadVehicle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  lastActivity: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  commission: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.success,
  },
  leadNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  leadActions: {
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  leadDetail: {
    backgroundColor: COLORS.lightGrey2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  leadDetailName: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  leadDetailVehicle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  leadDetailCurrent: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalSectionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  statusOption: {
    width: '30%',
    margin: 6,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  statusOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  modalInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  modalInfoText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: '#9a3412',
    flex: 1,
    lineHeight: 18,
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
