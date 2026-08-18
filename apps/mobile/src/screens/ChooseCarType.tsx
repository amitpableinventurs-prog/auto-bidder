import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, FONTS } from '../theme';
import { VEHICLE_CONFIGS } from '../constants/vehicleConfigs';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 48 - 12) / 3; // 3 columns, 16px side padding, 12px gap

const VEHICLE_TYPES = Object.values(VEHICLE_CONFIGS);

export default function ChooseCarType() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ChooseCarType'>>();
  const { brand, listingData } = route.params || {};
  const [selected, setSelected] = useState<string | null>(null);

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
            <MaterialCommunityIcons name="camera-iris" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>Choose Your Car Type</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Select vehicle type to begin guided photo capture</Text>

        {/* 3 × 2 grid */}
        <View style={styles.grid}>
          {VEHICLE_TYPES.map((item) => {
            const isSelected = selected === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(item.id)}
              >
                <Image
                  source={item.previewImage}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelActive]}>
                  {item.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Next button */}
        <Pressable
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.nextBtnText}>NEXT</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0d14' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
    flexShrink: 1,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONTS.poppins.regular,
    marginBottom: 24,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: CARD_W,
    height: CARD_W * 1.1,
    backgroundColor: '#161b2e',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '80%',
    height: '60%',
  },
  cardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: FONTS.poppins.semiBold,
  },
  cardLabelActive: {
    color: COLORS.secondary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextBtn: {
    marginTop: 36,
    height: 54,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    letterSpacing: 1,
  },
});
