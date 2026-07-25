import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import Logo from '../components/Logo';

const { width: SCREEN_W } = Dimensions.get('window');

type City = {
  id: string;
  name: string;
  imageUrl?: string;
};

const POPULAR_CITIES: City[] = [
  { id: 'ahmedabad', name: 'Ahmedabad', imageUrl: 'https://images.unsplash.com/photo-1626244795368-f9478f772712?auto=format&fit=crop&w=400&q=80' },
  { id: 'bengaluru', name: 'Bengaluru', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' },
  { id: 'delhi', name: 'Delhi', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
  { id: 'mumbai', name: 'Mumbai', imageUrl: 'https://images.unsplash.com/photo-1562331578-8314138e6022?auto=format&fit=crop&w=400&q=80' },
  { id: 'chennai', name: 'Chennai', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80' },
  { id: 'kolkata', name: 'Kolkata', imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=400&q=80' },
  { id: 'pune', name: 'Pune', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=400&q=80' },
  { id: 'jaipur', name: 'Jaipur', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80' },
  { id: 'chandigarh', name: 'Chandigarh', imageUrl: 'https://images.unsplash.com/photo-1614249468792-c463b17a95e7?auto=format&fit=crop&w=400&q=80' },
  { id: 'hyderabad', name: 'Hyderabad', imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=400&q=80' },
  { id: 'lucknow', name: 'Lucknow', imageUrl: 'https://images.unsplash.com/photo-1624815578748-39c15c3c7ac3?auto=format&fit=crop&w=400&q=80' },
  { id: 'indore', name: 'Indore', imageUrl: 'https://images.unsplash.com/photo-1631090428577-4f6ba2f8e6a2?auto=format&fit=crop&w=400&q=80' },
];

export default function LocationSearch() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Location'>>();
  const { onBack } = route.params || {};
  const { selectedCity, setSelectedCity } = useAppStore();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [otherCities, setOtherCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getCities()
      .then(res => {
        const popularNames = POPULAR_CITIES.map(c => c.name.toLowerCase());
        // Clean and deduplicate
        const uniqueCities = Array.from(new Set((res.cities || []).map(c => c.trim())));
        const filteredOthers = uniqueCities.filter(c => !popularNames.includes(c.toLowerCase()) && c.length > 0);
        setOtherCities(filteredOthers);
      })
      .catch(err => {

        console.warn("Failed to fetch cities, using local fallback", err);
        // Fallback to some common Indian cities
        setOtherCities(['Bhopal', 'Surat', 'Vadodara', 'Nagpur', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot']);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredPopular = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_CITIES;
    return POPULAR_CITIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const filteredOther = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return otherCities;
    return otherCities.filter((name) => name.toLowerCase().includes(q));
  }, [query, otherCities]);

  const handleSelect = (name: string) => {
    setSelectedCity(name);
    navigation.goBack();
    if (onBack) {
      onBack();
    }
  };

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow location access to detect your city automatically.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address?.city) {
        handleSelect(address.city);
      } else if (address?.subregion) {
        handleSelect(address.subregion);
      } else if (address?.region) {
        handleSelect(address.region);
      } else {
        Alert.alert('Not Found', 'Could not determine your city accurately. Please select manually.');
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'An error occurred while detecting location. Please try selecting manually.');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Top App Header consistent with Main screen */}
      <View style={styles.appTopHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 4 }}>
                <Ionicons name="chevron-back" size={28} color={COLORS.black2} />
            </Pressable>
            <Logo />
        </View>
        <View style={styles.appTopHeaderRight}>
          <Pressable style={styles.appIconBtn} onPress={() => navigation.navigate('MainDrawer', { screen: 'MainTabs', params: { screen: 'Activity', params: { initialTab: 'Notifications' } } } as any)}>
            <Ionicons name="notifications-outline" size={26} color={COLORS.black2} />
          </Pressable>
          <Pressable style={styles.appAvatarBtn} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarWrapperSmall}>
              <Image
                source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/100" }}
                style={styles.appAvatar}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Row 2: Back and Search */}
      <View style={styles.searchRowSection}>
        <Pressable style={styles.menuBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={32} color={COLORS.black2} />
        </Pressable>
        <View style={styles.searchBarContainer}>
           <Ionicons name="search-outline" size={22} color="#64748B" />
           <TextInput
             style={styles.searchInputField}
             value={query}
             onChangeText={setQuery}
             placeholder="Search for your city"
             placeholderTextColor={COLORS.textMuted}
             autoCapitalize="none"
             autoCorrect={false}
           />
           {query.length > 0 && (
             <Pressable onPress={() => setQuery('')}>
               <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
             </Pressable>
           )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Detect My Location */}
        <Pressable
          onPress={handleDetectLocation}
          style={styles.detectRow}
          disabled={detecting}
          accessibilityLabel="Detect my location"
          accessibilityRole="button"
        >
          {detecting ? (
            <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginRight: 10 }} />
          ) : (
            <Ionicons name="location-outline" size={20} color={COLORS.secondary} />
          )}
          <Text style={styles.detectText}>
            {detecting ? 'Detecting...' : 'Detect My Location'}
          </Text>
        </Pressable>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.error || '#F44336'} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={fetchCities}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Popular Cities */}
            {filteredPopular.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popular Cities</Text>
                </View>

                <View style={styles.popularGrid}>
                  {filteredPopular.map((city) => (
                    <Pressable
                      key={city.id}
                      onPress={() => handleSelect(city.name)}
                      style={styles.cityCard}
                      accessibilityLabel={`Select ${city.name}`}
                      accessibilityRole="button"
                    >
                      <View style={styles.cityImageWrap}>
                        <Image
                          source={{ uri: city.imageUrl }}
                          style={styles.cityImage}
                          resizeMode="cover"
                        />
                        {city.name === selectedCity && (
                          <View style={styles.citySelectedOverlay}>
                            <View style={styles.citySelectedBadge}>
                              <Ionicons name="checkmark" size={18} color={COLORS.white} />
                            </View>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cityName}>{city.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Other Cities */}
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.secondary} size="large" />
                <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Loading cities...</Text>
              </View>
            ) : (
              <>
                {filteredOther.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Other Cities</Text>
                    </View>

                    <View style={styles.otherCitiesContainer}>
                      {filteredOther.map((name) => (
                        <Pressable
                          key={name}
                          onPress={() => handleSelect(name)}
                          style={[
                            styles.cityChip,
                            name === selectedCity && styles.cityChipActive
                          ]}
                          accessibilityLabel={`Select ${name}`}
                          accessibilityRole="button"
                        >
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color={name === selectedCity ? COLORS.white : COLORS.textMuted}
                          />
                          <Text style={[
                            styles.cityChipText,
                            name === selectedCity && styles.cityChipTextActive
                          ]}>
                            {name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                {query.length > 0 && filteredPopular.length === 0 && filteredOther.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color={COLORS.lightGrey2} />
                    <Text style={styles.emptyTitle}>No cities found</Text>
                    <Text style={styles.emptySubtitle}>We couldn't find any results for "{query}"</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  appTopHeader: {
    height: 64,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  appTopHeaderRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  appIconBtn: { padding: 4 },
  appAvatarBtn: { marginLeft: 4 },
  avatarWrapperSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appAvatar: { width: "100%", height: "100%", borderRadius: 16, backgroundColor: COLORS.lightGrey2 },

  searchRowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  menuBtn: {
    padding: 2,
  },
  searchBarContainer: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInputField: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.medium,
    paddingLeft: 10,
  },
  detectRow: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detectText: {
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.semiBold,
    fontSize: 16,
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  cityCard: {
    width: (SCREEN_W - 32) / 3,
    padding: 4,
    marginBottom: 12,
  },
  cityImageWrap: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGrey2,
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  citySelectedOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(38, 104, 232, 0.2)',
  },
  citySelectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  cityName: {
    marginTop: 6,
    ...TYPOGRAPHY.bodySmall,
    fontSize: 14,
    color: COLORS.black2,
    textAlign: 'center',
    fontFamily: FONTS.poppins.semiBold,
  },
  otherCitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cityChipActive: {
    backgroundColor: COLORS.secondary,
  },
  cityChipText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: 6,
    fontFamily: FONTS.poppins.medium,
  },
  cityChipTextActive: {
    color: COLORS.white,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    fontFamily: FONTS.poppins.medium,
  },
  retryBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontFamily: FONTS.poppins.semiBold,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 18,
    color: COLORS.black2,
    marginTop: 16,
    fontFamily: FONTS.poppins.bold,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: FONTS.poppins.medium,
  },
});

