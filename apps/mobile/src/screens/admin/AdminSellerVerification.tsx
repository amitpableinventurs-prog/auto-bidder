import React, { useEffect, useState } from 'react';
import {
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ApiUser, getAllUsers, verifyUser } from '../../api';

const DARK = '#0f172a';
const LIGHT = '#f8fafc';

export default function AdminSellerVerification() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(res => setUsers(res.users))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = (userId: string, isVerified: boolean) => {
    verifyUser(userId, isVerified)
      .then(() => fetchUsers())
      .catch(err => console.warn(err));
  };

  const pendingSellers = users.filter(u => !u.isVerified);
  const verifiedSellers = users.filter(u => u.isVerified);

  const displayUsers = activeTab === 'pending' ? pendingSellers : verifiedSellers;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Seller Verification</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={activeTab === 'pending' ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={activeTab === 'pending' ? styles.tabTextActive : styles.tabText}>
            Pending ({pendingSellers.length})
          </Text>
        </Pressable>
        <Pressable
          style={activeTab === 'verified' ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab('verified')}
        >
          <Text style={activeTab === 'verified' ? styles.tabTextActive : styles.tabText}>
            Verified ({verifiedSellers.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={DARK} style={{ marginTop: 20 }} />
        ) : displayUsers.map(user => (
          <View key={user.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user.name || user.email || '?')[0].toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{user.name || 'Anonymous'}</Text>
                <Text style={styles.sub}>{user.email} • {user.phone || 'No Phone'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.docsRow}>
                <View style={styles.docItem}>
                    <Ionicons name="document-text" size={16} color="#64748b" />
                    <Text style={styles.docText}>Aadhaar</Text>
                </View>
                <View style={styles.docItem}>
                    <Ionicons name="card" size={16} color="#64748b" />
                    <Text style={styles.docText}>PAN Card</Text>
                </View>
            </View>

            {activeTab === 'pending' && (
              <View style={styles.actionRow}>
                  <Pressable style={styles.rejectBtn} onPress={() => Alert.alert('Reject Seller', `Are you sure you want to reject ${user.name || 'this seller'}?`)}>
                      <Text style={styles.rejectText}>Reject</Text>
                  </Pressable>
                  <Pressable style={styles.approveBtn} onPress={() => handleVerify(user.id, true)}>
                      <Text style={styles.approveText}>Approve Seller</Text>
                  </Pressable>
              </View>
            )}
            {activeTab === 'verified' && (
              <View style={styles.actionRow}>
                  <Pressable style={styles.rejectBtn} onPress={() => handleVerify(user.id, false)}>
                      <Text style={styles.rejectText}>Unverify Seller</Text>
                  </Pressable>
              </View>
            )}
          </View>
        ))}
        {!loading && displayUsers.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8' }}>
            No {activeTab} sellers found.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tab: { paddingVertical: 15, marginRight: 30 },
  tabActive: { paddingVertical: 15, marginRight: 30, borderBottomWidth: 2, borderBottomColor: DARK },
  tabText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: DARK, fontSize: 13, fontWeight: '700' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: DARK },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: DARK },
  sub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  docsRow: { flexDirection: 'row', gap: 15 },
  docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  docText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  actionRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  rejectBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  rejectText: { color: '#ef4444', fontSize: 13, fontWeight: '700' },
  approveBtn: { flex: 2, height: 44, borderRadius: 10, backgroundColor: DARK, alignItems: 'center', justifyContent: 'center' },
  approveText: { color: '#fff', fontSize: 13, fontWeight: '700' }
});
