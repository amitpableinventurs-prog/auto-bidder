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
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getSellerListings, deleteListing, type ApiListing } from '../api';
import { useAuth } from '../AuthContext';

const COLORS = {
  bg: "#F0F2F5",
  white: "#FFFFFF",
  primary: "#0056b3",
  secondary: "#6c757d",
  text: "#212529",
  textLight: "#6c757d",
  accent: "#f39c12",
  border: "#dee2e6",
  blue: "#0066CC",
  lightBlue: "#E7F1FF",
  red: "#ff4d4d",
  green: "#28a745",
};

export default function ListingManagement() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const userId = user?.id || '';

  const [tab, setTab] = useState('active');
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptions, setShowOptions] = useState<string | null>(null);

  const fetchListings = () => {
    if (!userId) return;
    getSellerListings(userId)
      .then(res => setListings(res?.listings || []))
      .catch(err => console.warn('Fetch listings failed', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchListings();
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleDelete = (listingId: string, title: string) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete ${title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteListing(listingId)
              .then(() => {
                setListings(prev => prev.filter(l => l.id !== listingId));
                Alert.alert("Success", "Listing deleted successfully");
              })
              .catch(err => Alert.alert("Error", err.message));
          }
        }
      ]
    );
  };

  const onEdit = (listing: ApiListing) => {
    navigation.navigate('FillDetails', { listingToEdit: listing });
  };

  const filteredListings = (listings || []).filter(l => {
    if (!l) return false;
    if (tab === 'active') return l.status === 'ACTIVE';
    if (tab === 'pending') return l.status === 'PENDING_INSPECTION';
    if (tab === 'drafts') return l.status === 'DRAFT';
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Inventory</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {['Active', 'Pending', 'Drafts'].map(t => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t.toLowerCase() && styles.tabActive]}
            onPress={() => setTab(t.toLowerCase())}
          >
            <Text style={[styles.tabText, tab === t.toLowerCase() && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.blue} style={{ marginTop: 50 }} />
        ) : filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No {tab} listings found</Text>
          </View>
        ) : (
          filteredListings.map(car => (
            <View key={car.id} style={styles.carCard}>
              <Image source={{ uri: car.imageUrl || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=300&q=80' }} style={styles.thumb} />
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.carTitle} numberOfLines={1}>{car.title}</Text>
                  <Pressable onPress={() => setShowOptions(showOptions === car.id ? null : car.id)}>
                      <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textLight} />
                  </Pressable>
                </View>

                {showOptions === car.id && (
                  <View style={styles.optionsPopup}>
                    <Pressable
                      style={styles.optionItem}
                      onPress={() => {
                        setShowOptions(null);
                        onEdit(car);
                      }}
                    >
                      <Ionicons name="pencil-outline" size={16} color={COLORS.blue} />
                      <Text style={[styles.optionText, { color: COLORS.blue }]}>Edit</Text>
                    </Pressable>
                    <View style={styles.optionDivider} />
                    <Pressable
                      style={styles.optionItem}
                      onPress={() => {
                        setShowOptions(null);
                        Alert.alert("Promote Listing", "Boost your car to the top for 24 hours for ₹499?");
                      }}
                    >
                      <MaterialCommunityIcons name="rocket-launch-outline" size={16} color={COLORS.accent} />
                      <Text style={[styles.optionText, { color: COLORS.accent }]}>Promote</Text>
                    </Pressable>
                    <View style={styles.optionDivider} />
                    <Pressable
                      style={styles.optionItem}
                      onPress={() => {
                        setShowOptions(null);
                        handleDelete(car.id, car.title);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                      <Text style={[styles.optionText, { color: COLORS.red }]}>Delete</Text>
                    </Pressable>
                  </View>
                )}

                <View style={styles.statusRow}>
                  <View style={[styles.badge, car.status === 'ACTIVE' ? styles.badgeGreen : car.status === 'PENDING_INSPECTION' ? styles.badgeYellow : styles.badgeGray]}>
                      <Text style={[styles.badgeText, car.status === 'ACTIVE' ? styles.badgeTextGreen : car.status === 'PENDING_INSPECTION' ? styles.badgeTextYellow : styles.badgeTextGray]}>
                          {car.status.replace('_', ' ')}
                      </Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <View>
                    <Text style={styles.label}>Bids</Text>
                    <Text style={styles.value}>{car.bids?.length || 0}</Text>
                  </View>
                  <View style={styles.vDivider} />
                  <View>
                    <Text style={styles.label}>Highest</Text>
                    <Text style={styles.value}><Text style={{ fontFamily: undefined }}>₹</Text> {car.bids?.[0]?.amount?.toLocaleString('en-IN') || '—'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },

  tabs: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.blue },
  tabText: { fontSize: 14, fontWeight: 'bold', color: COLORS.textLight },
  tabTextActive: { color: COLORS.blue },

  scrollContent: { padding: 15, backgroundColor: COLORS.bg, flexGrow: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textLight, marginTop: 15, fontSize: 16 },

  carCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    ...Platform.select({
      web: { boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' },
      default: {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }
    }),
    borderWidth: 1,
    borderColor: COLORS.border
  },
  thumb: { width: 90, height: 90, borderRadius: 8 },
  info: { flex: 1, marginLeft: 15 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  statusRow: { marginTop: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeGreen: { backgroundColor: '#f0fdf4' },
  badgeYellow: { backgroundColor: '#fff7ed' },
  badgeGray: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  badgeTextGreen: { color: COLORS.green },
  badgeTextYellow: { color: COLORS.accent },
  badgeTextGray: { color: COLORS.textLight },
  details: { flexDirection: 'row', marginTop: 15, alignItems: 'center', gap: 20 },
  vDivider: { width: 1, height: 20, backgroundColor: COLORS.border },
  label: { fontSize: 12, color: COLORS.textLight, marginBottom: 2, fontWeight: 'bold' },
  value: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },

  optionsPopup: {
    position: 'absolute',
    top: 25,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 100,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.2)' },
      default: {
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }
    }),
    width: 100,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  optionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
