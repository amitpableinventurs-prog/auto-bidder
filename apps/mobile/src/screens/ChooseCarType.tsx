import React, { useState, useRef } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, FONTS } from '../theme';
import { VEHICLE_CONFIGS } from '../constants/vehicleConfigs';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const VEHICLE_TYPES = Object.values(VEHICLE_CONFIGS);

export default function ChooseCarType() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ChooseCarType'>>();
  const { brand, listingData } = route.params || {};
  const [selected, setSelected] = useState<string | null>(null);

  // Animation values for each card (normally you'd use a single value or an array,
  // but for simplicity with a small fixed list, we can just handle the scale on selection)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSelect = (id: string) => {
    setSelected(id);
    scaleAnim.setValue(0.95);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handleNext = () => {
    if (selected) {
      navigation.navigate('CameraGuidance', {
        listingData: { ...(listingData || {}), carType: selected, brand: brand || listingData?.brand },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </Pressable>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="car-cog" size={32} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Car Type</Text>
            <Text style={styles.headerSubtitle}>Select your vehicle category</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {VEHICLE_TYPES.map((item) => {
            const isSelected = selected === item.id;
            return (
              <Animated.View
                key={item.id}
                style={[
                  { transform: [{ scale: isSelected ? scaleAnim : 1 }] }
                ]}
              >
                <Pressable
                  style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                  onPress={() => handleSelect(item.id)}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#1e6bd6" />
                    </View>
                  )}
                  <View style={styles.imageContainer}>
                    <Image
                      source={item.previewImage}
                      style={[styles.typeImage, isSelected && styles.typeImageSelected]}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>{item.name}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.progressContainer}>
             <View style={styles.progressLine} />
             <View style={[styles.progressLine, { backgroundColor: '#1e6bd6', width: '40%' }]} />
          </View>

          <Pressable
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!selected}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d162d' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e6bd6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e6bd6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    color: '#fff',
    fontFamily: FONTS.poppins.bold,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FONTS.poppins.regular,
    marginTop: -2,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  typeCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    backgroundColor: '#1c253d',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  typeCardSelected: {
    borderColor: '#1e6bd6',
    backgroundColor: 'rgba(30, 107, 214, 0.1)',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    zIndex: 10,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeImage: {
    width: '110%',
    height: '110%',
    opacity: 0.8,
  },
  typeImageSelected: {
    opacity: 1,
  },
  typeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.poppins.bold,
    marginTop: 10,
  },
  typeLabelSelected: {
    color: '#fff',
  },

  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 30,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e6bd6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#1e6bd6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.poppins.bold,
    letterSpacing: 0.5,
  },
});
