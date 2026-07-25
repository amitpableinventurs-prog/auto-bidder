import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  useWindowDimensions,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ALL_BRANDS, sortBrandsByPriority } from '../utils/brands';
import { getBrands } from '../api';
import { COLORS, FONTS } from '../theme';
import ScreenWrapper from '../components/ScreenWrapper';

export default function AllBrands() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_W } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState(sortBrandsByPriority(ALL_BRANDS));

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await getBrands();
      if (res?.brands && res.brands.length > 0) {
        setBrands(sortBrandsByPriority(res.brands));
      }
    } catch (err) {
      console.warn('Failed to fetch brands, using static list');
    }
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderBrand = ({ item }: { item: any }) => (
    <Pressable
      style={styles.brandCard}
      onPress={() => navigation.navigate('BrandDetails', { brand: item })}
    >
      <View style={styles.logoContainer}>
        <Image
          source={typeof item.logo === 'string' ? { uri: item.logo } : item.logo}
          style={styles.brandLogo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.brandName}>{item.name}</Text>
      <Text style={styles.brandCount}>{item.count || '0 Cars'}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>All Brands</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.grey} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredBrands}
        renderItem={renderBrand}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  searchSection: { padding: 15 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.black2,
    fontFamily: FONTS.openSans.regular,
  },
  listContent: { padding: 10, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 15 },
  brandCard: {
    width: (Dimensions.get('window').width - 48) / 3,
    backgroundColor: '#EBF2FA',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
    aspectRatio: 1,
    justifyContent: 'center',
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  logoContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandLogo: { width: '100%', height: '100%' },
  brandName: { fontSize: 12, fontFamily: FONTS.poppins.bold, color: COLORS.black2, textAlign: 'center' },
  brandCount: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontFamily: FONTS.openSans.regular },
});
