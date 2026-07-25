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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT } from '../../theme';
import { useAuth } from '../../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const MOCK_DNP_USERS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    referralCode: 'AB-DNP-1234',
    membershipStatus: 'ACTIVE',
    totalEarnings: 45000,
    totalReferrals: 15,
    activeListings: 8,
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    referralCode: 'AB-DNP-1235',
    membershipStatus: 'ACTIVE',
    totalEarnings: 32000,
    totalReferrals: 12,
    activeListings: 5,
    joinedDate: '2024-01-18',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    referralCode: 'AB-DNP-1236',
    membershipStatus: 'PENDING',
    totalEarnings: 0,
    totalReferrals: 0,
    activeListings: 0,
    joinedDate: '2024-01-20',
  },
];

export default function AdminDNPManagementScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [dnpUsers, setDnpUsers] = useState(MOCK_DNP_USERS);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const filteredUsers = dnpUsers.filter(user => {
    const matchesStatus = !filterStatus || user.membershipStatus === filterStatus;
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const fetchDNPUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/admin/dnp/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDnpUsers(data.profiles || []);
      }
    } catch (error) {
      console.error('DNP Users Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDNPUsers();
  }, []);

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/admin/dnp/profiles/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          membershipStatus: newStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDnpUsers(dnpUsers.map(user => user.id === userId ? { ...user, membershipStatus: newStatus } : user));
        Alert.alert('Success', 'DNP status updated successfully');
      } else {
        Alert.alert('Error', data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status Update Error:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return COLORS.success;
      case 'PENDING': return COLORS.accent;
      case 'SUSPENDED': return COLORS.coral;
      case 'TERMINATED': return COLORS.grey;
      default: return COLORS.grey;
    }
  };

  const renderDNPUserCard = (dnpUser: any) => (
    <View key={dnpUser.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{dnpUser.name}</Text>
          <Text style={styles.userEmail}>{dnpUser.email}</Text>
          <Text style={styles.userPhone}>{dnpUser.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dnpUser.membershipStatus) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(dnpUser.membershipStatus) }]}>
            {dnpUser.membershipStatus}
          </Text>
        </View>
      </View>

      <View style={styles.userStats}>
        <StatItem label="Referral Code" value={dnpUser.referralCode} />
        <StatItem label="Total Earnings" value={`₹${dnpUser.totalEarnings.toLocaleString()}`} />
        <StatItem label="Referrals" value={dnpUser.totalReferrals} />
        <StatItem label="Active Listings" value={dnpUser.activeListings} />
      </View>

      <View style={styles.userActions}>
        <Pressable 
          style={styles.actionBtn}
          onPress={() => {
            setSelectedUser(dnpUser);
            setShowActionModal(true);
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.black2} />
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
        <Text style={styles.headerTitle}>DNP Management</Text>
        <Pressable style={styles.addBtn} onPress={() => {}}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </Pressable>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSummary}>
        <SummaryStat label="Total DNPs" value={dnpUsers.length} color={COLORS.secondary} />
        <SummaryStat label="Active" value={dnpUsers.filter(u => u.membershipStatus === 'ACTIVE').length} color={COLORS.success} />
        <SummaryStat label="Pending" value={dnpUsers.filter(u => u.membershipStatus === 'PENDING').length} color={COLORS.accent} />
        <SummaryStat label="Suspended" value={dnpUsers.filter(u => u.membershipStatus === 'SUSPENDED').length} color={COLORS.coral} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search DNP users..."
          placeholderTextColor={COLORS.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
          style={[styles.filterChip, filterStatus === 'ACTIVE' && styles.filterChipActive]}
          onPress={() => setFilterStatus('ACTIVE')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'ACTIVE' && styles.filterChipTextActive]}>
            Active
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
          style={[styles.filterChip, filterStatus === 'SUSPENDED' && styles.filterChipActive]}
          onPress={() => setFilterStatus('SUSPENDED')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'SUSPENDED' && styles.filterChipTextActive]}>
            Suspended
          </Text>
        </Pressable>
      </ScrollView>

      {/* DNP Users List */}
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map(renderDNPUserCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No DNP users found</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage DNP User</Text>
              <Pressable onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>

            <View style={styles.modalUserInfo}>
              <Text style={styles.modalUserName}>{selectedUser.name}</Text>
              <Text style={styles.modalUserCode}>{selectedUser.referralCode}</Text>
              <Text style={styles.modalUserStatus}>
                Current Status: <Text style={{ color: getStatusColor(selectedUser.membershipStatus) }}>
                  {selectedUser.membershipStatus}
                </Text>
              </Text>
            </View>

            <Text style={styles.modalSectionTitle}>Update Status</Text>
            <View style={styles.statusOptions}>
              <Pressable
                style={styles.statusOption}
                onPress={() => handleStatusUpdate(selectedUser.id, 'ACTIVE')}
              >
                <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.statusOptionText}>Activate</Text>
              </Pressable>
              <Pressable
                style={styles.statusOption}
                onPress={() => handleStatusUpdate(selectedUser.id, 'SUSPENDED')}
              >
                <View style={[styles.statusDot, { backgroundColor: COLORS.coral }]} />
                <Text style={styles.statusOptionText}>Suspend</Text>
              </Pressable>
              <Pressable
                style={styles.statusOption}
                onPress={() => handleStatusUpdate(selectedUser.id, 'TERMINATED')}
              >
                <View style={[styles.statusDot, { backgroundColor: COLORS.grey }]} />
                <Text style={styles.statusOptionText}>Terminate</Text>
              </Pressable>
            </View>

            <Pressable style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsBtnText}>View Full Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
            </Pressable>
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

function StatItem({ label, value }: { label: string, value: string | number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function SummaryStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryStatValue, { color }]}>{value}</Text>
      <Text style={styles.summaryStatLabel}>{label}</Text>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
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
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    marginBottom: 4,
  },
  summaryStatLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
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
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  userEmail: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  userPhone: {
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
  userStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  statItem: {
    width: '45%',
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  statValue: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalUserInfo: {
    backgroundColor: COLORS.lightGrey2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  modalUserName: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  modalUserCode: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  modalUserStatus: {
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
  statusOptions: {
    gap: 12,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.lightGrey2,
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  viewDetailsBtnText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
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
