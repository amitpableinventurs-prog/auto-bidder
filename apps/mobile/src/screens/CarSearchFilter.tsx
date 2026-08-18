import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ALL_BRANDS } from '../utils/brands';
import { getBrands } from '../api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

const PRICE_RANGES = [
  { label: 'Upto 2L', min: 0, max: 2 },
  { label: '2L - 5L', min: 2, max: 5 },
  { label: '5L - 10L', min: 5, max: 10 },
  { label: '10L - 15L', min: 10, max: 15 },
  { label: '15L+', min: 15, max: 100 },
];

export default function CarSearchFilter() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null);
  const [selectedFuelType, setSelectedFuelType] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brands, setBrands] = useState<any[]>(ALL_BRANDS);

  const [expandedSection, setExpandedSection] = useState<string | null>('brands');

  useFocusEffect(
    React.useCallback(() => {
      fetchBrands();
    }, [])
  );

  const fetchBrands = async () => {
    try {
      const res = await getBrands();
      if (res?.brands) {
        setBrands(res.brands);
      }
    } catch (err) {
      console.warn("Failed to fetch brands in filter", err);
    }
  };

  const handleApply = () => {
    navigation.navigate('MainDrawer', {
      screen: 'MainTabs',
      params: {
        screen: 'BuyCar',
        params: {
          filters: {
            search,
            brand: selectedBrand,
            minPrice: selectedRange?.min,
            maxPrice: selectedRange?.max,
            carType: selectedCarType,
            fuelType: selectedFuelType,
          }
        }
      }
    });
  };

  const handleClear = () => {
    setSearch('');
    setSelectedBrand(null);
    setSelectedRange(null);
    setSelectedCarType(null);
    setSelectedFuelType(null);
  };

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderTags = (tags: string[], selected: string | null, onSelect: (tag: string) => void) => (
    <View style={styles.tagGrid}>
      {tags.map(tag => (
        <Pressable
          key={tag}
          style={[styles.tagChip, selected === tag && styles.tagChipActive]}
          onPress={() => onSelect(tag === selected ? null : (tag as any))}
        >
          <Text style={[styles.tagText, selected === tag && styles.tagTextActive]}>{tag}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <View style={styles.searchBar}>
           <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
           <View style={{ flex: 1, height: '100%', justifyContent: 'center' }}>
             <TextInput
               style={styles.searchInput}
               value={search}
               onChangeText={setSearch}
               autoFocus
               autoCorrect={false}
             />
             {search.length === 0 && (
               <View style={[styles.searchPlaceholderOverlay, { pointerEvents: 'none' }]}>
                 <Text style={styles.searchPlaceholderText}>Search for <Text style={styles.placeholderHighlight}>"New Cars"</Text></Text>
               </View>
             )}
           </View>
           {search.length > 0 && (
             <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.grey} />
             </Pressable>
           )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSectionHeader('Trending Searches')}
        {renderTags(['Hyundai I10', 'Maruti Baleno', 'Maruti Alto', 'Hyundai Creta'], search, setSearch)}

        {renderSectionHeader('Car Type')}
        {renderTags(['SUV', 'Sedan', 'Hatchback', 'MUV', 'Coupe'], selectedCarType, setSelectedCarType)}

        {renderSectionHeader('Fuel Type')}
        {renderTags(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'], selectedFuelType, setSelectedFuelType)}

        <Pressable style={styles.accordion} onPress={() => setExpandedSection(expandedSection === 'brands' ? null : 'brands')}>
           <Text style={styles.accordionTitle}>Popular Brands</Text>
           <Ionicons name={expandedSection === 'brands' ? "chevron-up" : "chevron-down"} size={20} color={COLORS.black2} />
        </Pressable>

        {expandedSection === 'brands' && (
          <View>
            <View style={styles.brandsGrid}>
              {(showAllBrands ? brands : brands.slice(0, 9)).map(brand => (
                <Pressable
                  key={brand.id}
                  style={[styles.brandItem, selectedBrand === brand.name && styles.brandItemActive]}
                  onPress={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                >
                  <Image source={brand.logo} style={styles.brandLogo} resizeMode="contain" />
                  <Text style={styles.brandName}>{brand.name}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
                style={styles.viewAllBrandsBtn}
                onPress={() => setShowAllBrands(!showAllBrands)}
            >
                <Text style={styles.viewAllBrandsText}>{showAllBrands ? "VIEW LESS" : "VIEW ALL BRANDS"}</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.accordion} onPress={() => setExpandedSection(expandedSection === 'price' ? null : 'price')}>
           <Text style={styles.accordionTitle}>Price Range</Text>
           <Ionicons name={expandedSection === 'price' ? "chevron-up" : "chevron-down"} size={20} color={COLORS.black2} />
        </Pressable>

        {expandedSection === 'price' && (
          <View style={styles.tagGrid}>
            {PRICE_RANGES.map(range => (
              <Pressable
                key={range.label}
                style={[styles.tagChip, selectedRange?.label === range.label && styles.tagChipActive]}
                onPress={() => setSelectedRange(selectedRange?.label === range.label ? null : range)}
              >
                <Text style={[styles.tagText, selectedRange?.label === range.label && styles.tagTextActive]}>{range.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.footerBtns}>
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>CLEAR ALL</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>APPLY FILTERS</Text>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.medium,
    padding: 0,
    zIndex: 2,
  },
  searchPlaceholderOverlay: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  searchPlaceholderText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.medium,
  },
  placeholderHighlight: {
    color: COLORS.secondary,
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
  },

  content: { padding: 20 },
  sectionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    marginBottom: 16,
    color: COLORS.black2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  tagChip: {
    backgroundColor: COLORS.lightBlue1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tagChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  tagText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  tagTextActive: { color: COLORS.white, fontFamily: FONTS.poppins.bold },

  accordion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
    marginBottom: 16,
  },
  accordionTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },

  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  brandItem: {
    width: (SCREEN_W - 64) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lightGrey2,
  },
  brandItemActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.lightBlue1,
  },
  brandLogo: { width: 36, height: 36 },
  brandName: { fontSize: 12, color: COLORS.black2, marginTop: 8, textAlign: 'center', fontFamily: FONTS.poppins.medium },

  viewAllBrandsBtn: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  viewAllBrandsText: { fontSize: 14, fontFamily: FONTS.poppins.bold, color: COLORS.secondary },

  footerBtns: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.coral,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    ...Platform.select({
      web: { boxShadow: `0px 4px 8px rgba(38, 104, 232, 0.2)` }, // COLORS.secondary is approx #2668E8
      default: {
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }
    }),
  },
  clearBtnText: { color: COLORS.coral, fontFamily: FONTS.poppins.bold, fontSize: 16 },
  applyBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 16 },
});
