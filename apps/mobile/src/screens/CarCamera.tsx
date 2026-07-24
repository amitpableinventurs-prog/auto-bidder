import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Alert,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { uploadFile } from '../api';

const { width, height } = Dimensions.get('window');

type Angle = { label: string; mandatory: boolean };

const ANGLES_BY_CATEGORY: Record<string, Angle[]> = {
  Exterior: [
    { label: 'Front', mandatory: true },
    { label: 'Front Left 45°', mandatory: true },
    { label: 'Left Side', mandatory: true },
    { label: 'Rear Left 45°', mandatory: true },
    { label: 'Rear', mandatory: true },
    { label: 'Rear Right 45°', mandatory: true },
    { label: 'Right Side', mandatory: true },
    { label: 'Front Right 45°', mandatory: true },
  ],
  Interior: [
    { label: 'Dashboard', mandatory: true },
    { label: 'Instrument Cluster', mandatory: true },
    { label: 'Front Seats', mandatory: false },
    { label: 'Rear Seats', mandatory: false },
    { label: 'Infotainment', mandatory: false },
    { label: 'Gear & Console', mandatory: false },
  ],
  Detail: [
    { label: 'Front Tyres', mandatory: false },
    { label: 'Rear Tyres', mandatory: false },
    { label: 'Engine Bay', mandatory: false },
    { label: 'Headlights', mandatory: false },
    { label: 'Tail Lights', mandatory: false },
    { label: 'Roof / Sunroof', mandatory: false },
  ],
  Custom: [{ label: 'Any Angle', mandatory: false }],
};

const CATEGORIES = ['Exterior', 'Interior', 'Detail', 'Custom'];

export default function CarCamera() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CarCamera'>>();
  const { listingData } = (route.params as any) || {};

  const [category, setCategory] = useState('Exterior');
  const [flash, setFlash] = useState(false);
  const [angleIndex, setAngleIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [capturedAngles, setCapturedAngles] = useState<Record<string, Set<number>>>({});
  const [uploading, setUploading] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  const angles = ANGLES_BY_CATEGORY[category];
  const currentAngle = angles[Math.min(angleIndex, angles.length - 1)];
  const capturedSet = capturedAngles[category] || new Set<number>();
  const isCurrentCaptured = capturedSet.has(angleIndex);

  const changeCategory = (cat: string) => {
    setCategory(cat);
    setAngleIndex(0);
    setTimeout(() => {
      carouselRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  };

  const scrollToAngle = (idx: number) => {
    setAngleIndex(idx);
    carouselRef.current?.scrollToOffset({ offset: idx * width, animated: true });
  };

  const handlePrevAngle = () => {
    if (angleIndex > 0) scrollToAngle(angleIndex - 1);
  };

  const handleNextAngle = () => {
    if (angleIndex < angles.length - 1) scrollToAngle(angleIndex + 1);
  };

  const onCarouselScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== angleIndex) setAngleIndex(idx);
  };

  const advanceToNextUncaptured = (justCaptured: number) => {
    const set = new Set(capturedSet);
    set.add(justCaptured);
    let next = -1;
    for (let i = 0; i < angles.length; i++) {
      if (!set.has(i)) { next = i; break; }
    }
    if (next >= 0) scrollToAngle(next);
  };

  const handleCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Required', 'Please allow camera access in Settings to capture car photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        try {
          setUploading(true);
          const { url } = await uploadFile(result.assets[0].uri, result.assets[0].mimeType, result.assets[0].fileName || undefined);
          setCapturedImages(prev => [...prev, url]);
          setCapturedAngles(prev => {
            const set = new Set(prev[category] || []);
            set.add(angleIndex);
            return { ...prev, [category]: set };
          });
          advanceToNextUncaptured(angleIndex);
        } catch {
          Alert.alert('Error', 'Failed to upload captured image.');
        } finally {
          setUploading(false);
        }
      }
    } catch {
      Alert.alert('Error', 'Could not open the camera. Please try again.');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        setUploading(true);
        const urls: string[] = [];
        for (const asset of result.assets) {
          const { url } = await uploadFile(asset.uri, asset.mimeType, asset.fileName || undefined);
          urls.push(url);
        }
        setCapturedImages(prev => [...prev, ...urls]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick images from gallery.');
    } finally {
      setUploading(false);
    }
  };

  const handleDone = () => {
    if (capturedImages.length === 0) {
      Alert.alert('No Photos', 'Please capture or select at least one car photo.');
      return;
    }
    const updatedListingData = {
      ...listingData,
      images: capturedImages,
      imageUrl: capturedImages[0],
    };
    navigation.navigate('FillDetails', { listingData: updatedListingData, initialTab: 'basic' } as any);
  };

  const renderSuggestion = ({ item, index }: { item: Angle; index: number }) => {
    const captured = capturedSet.has(index);
    return (
      <View style={styles.slide}>
        <View style={[styles.suggestionCard, captured && styles.suggestionCardCaptured]}>
          <MaterialCommunityIcons name="car-outline" size={width * 0.55} color="rgba(255,255,255,0.6)" />
          {captured && (
            <View style={styles.capturedTag}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.capturedTagText}>Captured</Text>
            </View>
          )}
        </View>
        <View style={styles.angleLabelRow}>
          <Text style={styles.angleLabel}>{item.label}</Text>
          <View style={[styles.badge, item.mandatory ? styles.badgeMandatory : styles.badgeOptional]}>
            <Text style={styles.badgeText}>{item.mandatory ? 'Mandatory' : 'Optional'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Green framing guide — sits within safe area, inset from edges */}
      <View style={styles.greenFrame} pointerEvents="none" />

      {/* Category tabs */}
      <View style={styles.header}>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((cat) => (
            <Pressable key={cat} onPress={() => changeCategory(cat)} style={styles.categoryTab}>
              <View style={[styles.radio, category === cat && styles.radioActive]} />
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Top-left controls */}
      <View style={styles.leftControls}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => setFlash(!flash)}>
          <Ionicons name={flash ? 'flash' : 'flash-off'} size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Done */}
      <Pressable style={[styles.doneBtn, capturedImages.length === 0 && { opacity: 0.5 }]} onPress={handleDone}>
        <Text style={styles.doneBtnText}>{capturedImages.length > 0 ? `DONE (${capturedImages.length})` : 'DONE'}</Text>
      </Pressable>

      {/* Swipeable suggestion carousel — full width, large landscape cards */}
      <View style={styles.carouselArea}>
        {/* Left arrow */}
        <Pressable
          style={[styles.carouselArrow, styles.carouselArrowLeft, angleIndex === 0 && { opacity: 0.25 }]}
          onPress={handlePrevAngle}
          disabled={angleIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>

        <FlatList
          ref={carouselRef}
          data={angles}
          keyExtractor={(_, i) => `${category}-${i}`}
          renderItem={renderSuggestion}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onCarouselScrollEnd}
          extraData={`${category}-${angleIndex}-${capturedImages.length}`}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          disableIntervalMomentum
        />

        {/* Right arrow */}
        <Pressable
          style={[styles.carouselArrow, styles.carouselArrowRight, angleIndex === angles.length - 1 && { opacity: 0.25 }]}
          onPress={handleNextAngle}
          disabled={angleIndex === angles.length - 1}
        >
          <Ionicons name="chevron-forward" size={28} color="#fff" />
        </Pressable>

        <Text style={styles.swipeHint}>
          Tap arrows or swipe  •  {angleIndex + 1} / {angles.length}
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.galleryBtn} onPress={handlePickFromGallery} disabled={uploading}>
          <Ionicons name="images-outline" size={24} color="#fff" />
          <Text style={styles.galleryBtnText}>Gallery</Text>
        </Pressable>

        <Pressable style={styles.shutterBtn} onPress={handleCapture} disabled={uploading}>
          <View style={[styles.shutterInner, isCurrentCaptured && { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="camera" size={34} color="#2563eb" />
          </View>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </View>
    </View>
  );
}

const CAROUSEL_TOP = height * 0.30;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },

  greenFrame: {
    position: 'absolute',
    top: 110,
    left: 6,
    right: 6,
    bottom: height * 0.40,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 18,
    zIndex: 1,
  },

  header: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  categoriesContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
  },
  categoryTab: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radio: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  radioActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoryText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },

  leftControls: { position: 'absolute', left: 20, top: 50, gap: 16, zIndex: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },

  doneBtn: { position: 'absolute', top: 55, right: 20, backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, zIndex: 10 },
  doneBtnText: { color: '#fff', fontWeight: 'bold' },

  carouselArea: {
    position: 'absolute',
    top: CAROUSEL_TOP,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  slide: { width, alignItems: 'center', justifyContent: 'center' },
  suggestionCard: {
    width: width * 0.92,
    aspectRatio: 16 / 9,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionCardCaptured: { borderColor: '#22c55e' },
  capturedTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capturedTagText: { color: '#22c55e', fontSize: 11, fontWeight: '700' },

  angleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  angleLabel: { color: '#fff', fontSize: 18, fontWeight: '800' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeMandatory: { backgroundColor: 'rgba(239,68,68,0.85)' },
  badgeOptional: { backgroundColor: 'rgba(100,116,139,0.85)' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  carouselArrow: {
    position: 'absolute',
    top: '30%',
    zIndex: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselArrowLeft: { left: 8 },
  carouselArrowRight: { right: 8 },

  swipeHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    zIndex: 10,
  },
  galleryBtn: { width: 64, alignItems: 'center', gap: 4 },
  galleryBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  bottomSpacer: { width: 64 },
  shutterBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(37,99,235,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
