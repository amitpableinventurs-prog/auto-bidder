import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ApiUser, getAllUsers } from '../../api';

const DARK = '#0f172a';
const LIGHT = '#f8fafc';
const BLUE = '#2563eb';

export default function AdminUserManagement() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(res => setUsers(res.users))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Search users by name, email or phone"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={BLUE} style={{ marginTop: 20 }} />
        ) : filteredUsers.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>No users found.</Text>
        ) : (
          filteredUsers.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user.name || user.email || '?')[0].toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.userName}>{user.name || 'Anonymous User'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.tagRow}>
                    <View style={styles.roleTag}><Text style={styles.tagText}>{user.phone || 'No Phone'}</Text></View>
                    <View style={[styles.statusTag, { backgroundColor: user.isVerified ? '#ecfdf5' : '#fff7ed' }]}>
                        <Text style={[styles.tagText, { color: user.isVerified ? '#059669' : '#c2410c' }]}>{user.isVerified ? 'Verified' : 'Unverified'}</Text>
                    </View>
                </View>
              </View>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => Alert.alert('Add User', 'User creation tool is under development.')}>
        <Ionicons name="person-add" size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 15, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, marginLeft: 10, fontSize: 14 },
  content: { paddingHorizontal: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 12, elevation: 1 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: BLUE + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: BLUE, fontWeight: '700', fontSize: 18 },
  info: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 15, fontWeight: '700', color: DARK },
  userEmail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  roleTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  actionBtn: { padding: 5 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', elevation: 5 }
});
