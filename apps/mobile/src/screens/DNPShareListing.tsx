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
} from 'react-native';
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
    title: '2022 Honda City ZX',
    brand: 'Honda',
    model: 'City',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80',
    demandPrice: 850000,
    status: 'ACTIVE',
    city: 'Mumbai',
  },
  {
    id: '2',
    title: '2021 Hyundai Creta SX',
    brand: 'Hyundai',
    model: 'Creta',
    imageUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=400&q=80',
    demandPrice: 1200000,
    status: 'ACTIVE',
    city: 'Delhi',
  },
  {
    id: '3',
    title: '2023 Maruti Swift VXI',
    brand: 'Maruti',
    model: 'Swift',
    imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=400&q=80',
    demandPrice: 650000,
    status: 'ACTIVE',
    city: 'Bangalore',
  },
];

export default function DNPShareListingScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShareListing = async (listing: any) => {
    setSelectedListing(listing);
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/share-listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing.id,
          shareSource: 'DIRECT',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShareLink(data.shareLink);
        setShowShareModal(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Share Error:', error);
      Alert.alert('Error', 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleShareVia = async (platform: string) => {
    const message = `Check out this ${selectedListing.title} on Auto Bidder!\n\n${shareLink}`;
    
    try {
      if (platform === 'whatsapp') {
        Alert.alert('WhatsApp', 'Opening WhatsApp...');
      } else if (platform === 'facebook') {
        Alert.alert('Facebook', 'Opening Facebook...');
      } else if (platform === 'telegram') {
        Alert.alert('Telegram', 'Opening Telegram...');
      } else if (platform === 'copy') {
        // Copy to clipboard
        Alert.alert('Copied!', 'Link copied to clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <Pressable style={styles.listingCard} onPress={() => handleShareListing(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.listingMeta}>
          <Text style={styles.listingPrice}>₹{(item.demandPrice / 100000).toFixed(2)}L</Text>
          <Text style={styles.listingCity}>{item.city}</Text>
        </View>
        <View style={styles.listingStatus}>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
            <Text style={[styles.statusText, { color: COLORS.success }]}>Active</Text>
          </View>
        </View>
      </View>
      <Ionicons name="share-social-outline" size={20} color={COLORS.secondary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Share Existing Listings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={COLORS.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        }
      />

      {/* Share Modal */}
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
                <Image source={{ uri: selectedListing.imageUrl }} style={styles.selectedImage} />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{selectedListing.title}</Text>
                  <Text style={styles.selectedPrice}>₹{selectedListing.demandPrice.toLocaleString()}</Text>
                </View>
              </View>
            )}

            <View style={styles.shareLinkBox}>
              <Text style={styles.shareLink} numberOfLines={2}>{shareLink}</Text>
              <Pressable style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={18} color={COLORS.white} />
              </Pressable>
            </View>

            <Text style={styles.shareViaTitle}>Share Via</Text>
            <View style={styles.shareOptions}>
              <ShareOption
                icon="logo-whatsapp"
                label="WhatsApp"
                color="#25D366"
                onPress={() => handleShareVia('whatsapp')}
              />
              <ShareOption
                icon="logo-facebook"
                label="Facebook"
                color="#1877F2"
                onPress={() => handleShareVia('facebook')}
              />
              <ShareOption
                icon="send"
                label="Telegram"
                color="#0088cc"
                onPress={() => handleShareVia('telegram')}
              />
              <ShareOption
                icon="copy-outline"
                label="Copy Link"
                color={COLORS.secondary}
                onPress={() => handleShareVia('copy')}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent} />
              <Text style={styles.infoText}>
                When buyers view or purchase through your link, you'll earn commissions. Track all your shared listings in the dashboard.
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
    </View>
  );
}

function ShareOption({ icon, label, color, onPress }: { 
  icon: any, 
  label: string, 
  color: string, 
  onPress: () => void 
}) {
  return (
    <Pressable style={styles.shareOption} onPress={onPress}>
      <View style={[styles.shareOptionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.shareOptionLabel}>{label}</Text>
    </Pressable>
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    alignItems: 'center',
  },
  listingImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  listingContent: {
    flex: 1,
  },
  listingTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  listingPrice: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
  },
  listingCity: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  listingStatus: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
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
  selectedListing: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGrey2,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedImage: {
    width: 60,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  selectedPrice: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
  },
  shareLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  shareLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 12,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareViaTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 12,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  shareOption: {
    alignItems: 'center',
    flex: 1,
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
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
