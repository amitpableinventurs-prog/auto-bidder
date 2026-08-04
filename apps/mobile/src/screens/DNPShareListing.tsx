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
  Image,
  FlatList,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPShareListingScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState<'QUICK' | 'LEAD'>('LEAD');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const fetchListings = async (query = '') => {
    setLoading(true);
    try {
      const data = await request<any>(`/api/dnp/eligible-listings?search=${query}`);
      setListings(data.listings);
    } catch (error) {
      console.error('Fetch Listings Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Debounce would be better here
    if (text.length > 2 || text.length === 0) {
      fetchListings(text);
    }
  };

  const handleOpenShareModal = (listing: any) => {
    setSelectedListing(listing);
    setShareLink('');
    setBuyerName('');
    setBuyerPhone('');
    setShowShareModal(true);
  };

  const generateLink = async () => {
    if (!buyerName || !buyerPhone) {
      Alert.alert('Required', 'Please enter the prospect buyer name and mobile number.');
      return;
    }
    if (buyerPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const data = await request<any>('/api/dnp/listing-shares', {
        method: 'POST',
        body: JSON.stringify({
          listingId: selectedListing.id,
          buyerName,
          buyerPhone,
          shareMethod: 'DIRECT',
        }),
      });

      setShareLink(data.shareLink);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${selectedListing.brand} ${selectedListing.model} on Auto Bidder!\n\nView details: ${shareLink}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <Pressable style={styles.listingCard} onPress={() => handleOpenShareModal(item)}>
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.listingImage} />
      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.brand} {item.model}</Text>
        <Text style={styles.listingSub}>{item.manufacturingYear} • {item.fuelType} • {item.city}</Text>
        <Text style={styles.listingPrice}>₹{(item.demandPrice || 0).toLocaleString('en-IN')}</Text>
        <View style={styles.eligibilityBadge}>
          <Ionicons name="sparkles" size={10} color={COLORS.secondary} />
          <Text style={styles.eligibilityText}>Eligible for Reward</Text>
        </View>
      </View>
      <View style={styles.shareButtonSmall}>
        <Ionicons name="share-social-outline" size={20} color={COLORS.secondary} />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Browse & Share</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand or model..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 40 }} /> : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color={COLORS.lightGrey1} />
              <Text style={styles.emptyText}>No eligible listings found</Text>
            </View>
          )
        }
      />

      {showShareModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Listing</Text>
              <Pressable onPress={() => setShowShareModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>

            {selectedListing && (
              <View style={styles.selectedListing}>
                <Image source={{ uri: selectedListing.imageUrl || 'https://via.placeholder.com/150' }} style={styles.selectedImage} />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{selectedListing.brand} {selectedListing.model}</Text>
                  <Text style={styles.selectedPrice}>₹{selectedListing.demandPrice?.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            )}

            {!shareLink ? (
              <View>
                <Text style={styles.formLabel}>Enter Prospect Buyer Details</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Buyer Full Name"
                  value={buyerName}
                  onChangeText={setBuyerName}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Buyer Mobile Number (10-digit)"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={buyerPhone}
                  onChangeText={setBuyerPhone}
                />
                <Pressable style={styles.generateBtn} onPress={generateLink} disabled={loading}>
                  {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.generateBtnText}>Generate Share Link</Text>}
                </Pressable>
              </View>
            ) : (
              <View>
                <View style={styles.linkSuccess}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                  <Text style={styles.linkSuccessText}>Link registered to your DNP ID!</Text>
                </View>

                <View style={styles.linkBox}>
                  <Text style={styles.linkText} numberOfLines={1}>{shareLink}</Text>
                  <Pressable style={styles.copyBtn} onPress={() => Alert.alert('Copied', 'Link copied to clipboard')}>
                    <Ionicons name="copy-outline" size={18} color={COLORS.white} />
                  </Pressable>
                </View>

                <Pressable style={styles.shareViaBtn} onPress={handleNativeShare}>
                  <Ionicons name="share-social" size={20} color={COLORS.white} />
                  <Text style={styles.shareViaText}>Share with Buyer</Text>
                </Pressable>

                <Pressable style={styles.resetBtn} onPress={() => { setShareLink(''); setBuyerName(''); setBuyerPhone(''); }}>
                  <Text style={styles.resetBtnText}>New Share for this Car</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: 16, paddingHorizontal: 16, height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.lightGrey2 },
  searchInput: { flex: 1, marginLeft: 10, ...TYPOGRAPHY.bodySmall, color: COLORS.black2 },
  listContent: { padding: 16, paddingBottom: 40 },
  listingCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, padding: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  listingImage: { width: 90, height: 70, borderRadius: 12, marginRight: 16 },
  listingContent: { flex: 1 },
  listingTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 2 },
  listingSub: { ...TYPOGRAPHY.bodySmall, fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },
  listingPrice: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, fontSize: 14 },
  eligibilityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  eligibilityText: { fontSize: 9, color: COLORS.secondary, fontFamily: FONTS.poppins.bold, textTransform: 'uppercase' },
  shareButtonSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.lightBlue1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 12 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 1000 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold },
  selectedListing: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  selectedImage: { width: 70, height: 50, borderRadius: 8, marginRight: 12 },
  selectedInfo: { flex: 1 },
  selectedTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold },
  selectedPrice: { ...TYPOGRAPHY.bodySmall, color: COLORS.secondary, fontFamily: FONTS.poppins.bold },
  formLabel: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.textMuted, marginBottom: 12 },
  formInput: { height: 50, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, ...TYPOGRAPHY.bodySmall },
  generateBtn: { backgroundColor: COLORS.secondary, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  generateBtnText: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.white },
  linkSuccess: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'center' },
  linkSuccessText: { color: COLORS.green, fontFamily: FONTS.poppins.bold, fontSize: 13 },
  linkBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 20 },
  linkText: { flex: 1, fontSize: 12, color: COLORS.textMuted },
  copyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  shareViaBtn: { backgroundColor: COLORS.secondary, height: 54, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  shareViaText: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.white },
  resetBtn: { alignItems: 'center', marginTop: 20 },
  resetBtnText: { fontSize: 12, color: COLORS.grey, textDecorationLine: 'underline' },
});
