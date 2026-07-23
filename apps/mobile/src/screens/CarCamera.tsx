<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useRef, useState } from 'react';
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Alert,
  FlatList,
<<<<<<< HEAD
  Image,
=======
  NativeSyntheticEvent,
  NativeScrollEvent,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { uploadFile } from '../api';
<<<<<<< HEAD
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';
=======
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b

const { width, height } = Dimensions.get('window');

type Angle = { label: string; mandatory: boolean };

const ANGLES_BY_CATEGORY: Record<string, Angle[]> = {
  Exterior: [
<<<<<<< HEAD
    { id: 'front', label: 'Front', instruction: 'Try to Fit your Car inside borders', outline: require('../../assets/Satate=1, Name=Exterior.png'), mandatory: false },
    { id: 'leftFront', label: 'Left Front 45°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=2, Name=Exterior.png'), mandatory: true },
    { id: 'leftSide', label: 'Left Side 90°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=3, Name=Exterior.png'), mandatory: false },
    { id: 'leftBack', label: 'Left Back 135°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=4, Name=Exterior.png'), mandatory: false },
    { id: 'back', label: 'Back 180°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=5, Name=Exterior.png'), mandatory: false },
    { id: 'rightBack', label: 'Right Back 225°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=6, Name=Exterior.png'), mandatory: false },
    { id: 'rightSide', label: 'Right Side 270°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=7, Name=Exterior.png'), mandatory: false },
    { id: 'rightFront', label: 'Right Front 315°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=8, Name=Exterior.png'), mandatory: false },
  ],
  Interior: [
    { id: 'odometer', label: 'Odometer', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=1, Name=Interior.png'), mandatory: false },
    { id: 'frontPassDoor', label: 'Front Passenger Door', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=2, Name=Interior.png'), mandatory: false },
    { id: 'rightRearDoor', label: 'Right Rear Door', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=3, Name=Interior.png'), mandatory: false },
    { id: 'rearSeat', label: 'Rear Seat', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=4, Name=Interior.png'), mandatory: false },
    { id: 'trunk', label: 'Trunk', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=5, Name=Interior.png'), mandatory: false },
    { id: 'dashboard', label: 'Dashboard', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=6, Name=Interior.png'), mandatory: false },
    { id: 'centralDash', label: 'Central Dash', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=7, Name=Interior.png'), mandatory: false },
    { id: 'steering', label: 'Steering Wheel', instruction: 'Click here to upload Car\'s interior Images', outline: require('../../assets/Satate=8, Name=Interior.png'), mandatory: false },
  ],
  Detail: [
    { id: 'engine', label: 'Engine & Bonnet', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=1, Name=Detail.png'), mandatory: false },
    { id: 'spareTyre', label: 'Spare Tyre', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=2, Name=Detail.png'), mandatory: false },
    { id: 'pedals', label: 'Pedals', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=3, Name=Detail.png'), mandatory: false },
    { id: 'keys', label: 'Keys', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=4, Name=Detail.png'), mandatory: false },
    { id: 'rightFrontTyre', label: 'Right Front Tyre', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=5, Name=Detail.png'), mandatory: false },
    { id: 'rightRearTyre', label: 'Right Rear Tyre', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=6, Name=Detail.png'), mandatory: false },
    { id: 'leftFrontTyre', label: 'Left Front Tyre', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=7, Name=Detail.png'), mandatory: false },
    { id: 'leftRearTyre', label: 'Left Rear Tyre', instruction: 'Click here to upload Car\'s Detail Images', outline: require('../../assets/Satate=8, Name=Detail.png'), mandatory: false },
  ],
  Custom: [
    { id: 'custom', label: 'Custom', instruction: 'Click here to upload Car\'s Custom Images', outline: require('../../assets/Satate=1, Name=Custom.png'), mandatory: false },
  ]
=======
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
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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
<<<<<<< HEAD
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
=======
        mediaTypes: ['images'],
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        setUploading(true);
<<<<<<< HEAD
        for (const asset of result.assets) {
          const key = `${selectedCategory}_${currentAngle.id}`;
          const { url } = await uploadFile(asset.uri, 'image/jpeg', `picked_${key}_${Date.now()}.jpg`);
          setCapturedImages(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), url]
          }));
        }
=======
        const urls: string[] = [];
        for (const asset of result.assets) {
          const { url } = await uploadFile(asset.uri, asset.mimeType, asset.fileName || undefined);
          urls.push(url);
        }
        setCapturedImages(prev => [...prev, ...urls]);
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
      }
    } catch {
      Alert.alert('Error', 'Failed to pick images from gallery.');
    } finally {
      setUploading(false);
    }
  };

<<<<<<< HEAD
  const handleNext = () => {
    if (selectedAngleIndex < currentAngles.length - 1) {
      setSelectedAngleIndex(selectedAngleIndex + 1);
    } else {
      const catIdx = CATEGORIES.indexOf(selectedCategory);
      if (catIdx < CATEGORIES.length - 1) {
        setSelectedCategory(CATEGORIES[catIdx + 1]);
        setSelectedAngleIndex(0);
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = () => {
    // Check mandatory photos
    const missingMandatory: string[] = [];
    Object.keys(GUIDANCE_CONFIG).forEach(cat => {
        GUIDANCE_CONFIG[cat].forEach((angle: any) => {
            if (angle.mandatory && !capturedImages[`${cat}_${angle.id}`]?.length) {
                missingMandatory.push(`${cat} ${angle.label}`);
            }
        });
    });

    if (missingMandatory.length > 0) {
        Alert.alert(
<<<<<<< HEAD
            'Incomplete',
            'Please capture the following mandatory photos:\n\n' + missingMandatory.join('\n'),
            [{ text: 'OK' }]
=======
            'Mandatory Photos Required',
            'Please capture the following mandatory photos to proceed:\n\n' + missingMandatory.join('\n'),
            [
              { text: 'Capture Now', style: 'default' },
              {
                text: 'Exit Anyway',
                style: 'destructive',
                onPress: () => {
                   const allUrls = Object.values(capturedImages).flat();
                   const updatedListingData = {
                     ...listingData,
                     images: [...(listingData?.images || []), ...allUrls],
                     imageUrl: allUrls[0] || listingData?.imageUrl,
                     carType: selectedType,
                   };
                   navigation.navigate('FillDetails', { listingData: updatedListingData, initialTab: 'basic' } as any);
                }
              }
            ]
>>>>>>> 2ce57fb (Update project)
        );
        return;
    }

    const allUrls = Object.values(capturedImages).flat();
=======
  const handleDone = () => {
    if (capturedImages.length === 0) {
      Alert.alert('No Photos', 'Please capture or select at least one car photo.');
      return;
    }
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
    const updatedListingData = {
      ...listingData,
      images: capturedImages,
      imageUrl: capturedImages[0],
    };
<<<<<<< HEAD
    navigation.navigate('AuctionSetup', { listingData: updatedListingData });
=======
    navigation.navigate('FillDetails', { listingData: updatedListingData, initialTab: 'basic' } as any);
>>>>>>> 2ce57fb (Update project)
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

<<<<<<< HEAD
        {/* Green Guide Box - Edge to Edge */}
        <View style={[
            styles.edgeGuideBox,
            isAngleCorrect && styles.edgeGuideBoxGreen,
            { pointerEvents: 'none' }
        ]} />

        {/* Top Controls */}
        <View style={styles.topControls}>
          <Pressable onPress={handleBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </Pressable>
          <View style={styles.categoryBarLandscape}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setSelectedAngleIndex(0);
                }}
                style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
              >
                <Text style={[styles.categoryTabText, selectedCategory === cat && styles.categoryTabTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.iconBtn}>
            <MaterialCommunityIcons name="flash" size={28} color="#fff" />
          </Pressable>
        </View>

        {/* Center Content / Instructions */}
        <View style={styles.centerContentLandscape}>
          <View style={styles.instructionWrap}>
              <Text style={styles.instructionText}>
                {currentAngle.instruction}
              </Text>
          </View>

          <View style={styles.outlineWrapperLandscape}>
            {capturedImages[`${selectedCategory}_${currentAngle.id}`]?.length > 0 ? (
              <Image source={{ uri: capturedImages[`${selectedCategory}_${currentAngle.id}`][0] }} style={styles.capturedImg} resizeMode="cover" />
            ) : (
              <>
                {selectedCategory === 'Exterior' ? (
                   <Image
                      source={currentAngle.outline}
                      style={[styles.mainCarOutlineLandscape, { tintColor: isAngleCorrect ? "#22c55e" : "rgba(255,255,255,0.4)" }]}
                      resizeMode="contain"
                    />
                ) : (
                  <MaterialCommunityIcons name="camera-outline" size={100} color="rgba(255,255,255,0.2)" />
                )}
              </>
            )}
          </View>
        </View>

        {/* Sliding Angle Selector (Bottom) */}
        <View style={styles.angleSelectorContainer}>
            <FlatList
                ref={angleListRef}
                data={currentAngles}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.angleListContent}
                snapToAlignment="center"
                snapToInterval={110}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / 110);
                    if (index !== selectedAngleIndex && index >= 0 && index < currentAngles.length) {
                        setSelectedAngleIndex(index);
                    }
                }}
                renderItem={({ item, index }) => (
                    <Pressable
                        onPress={() => setSelectedAngleIndex(index)}
                        style={[
                            styles.angleItem,
                            selectedAngleIndex === index && styles.angleItemActive
                        ]}
                    >
                        {capturedImages[`${selectedCategory}_${item.id}`]?.length > 0 && (
                            <View style={styles.checkBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                            </View>
                        )}
                        <View style={styles.angleMiniPreview}>
                             <Image
                                source={item.outline}
                                style={[styles.miniOutlineImg, { tintColor: selectedAngleIndex === index ? "#fff" : "rgba(255,255,255,0.3)" }]}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.angleItemLabel, selectedAngleIndex === index && styles.angleItemLabelActive]} numberOfLines={1}>
                            {item.label}
                        </Text>
                    </Pressable>
                )}
            />
        </View>

        {/* Right Controls - Capture & Zoom */}
        <View style={styles.rightControlsLandscape}>
            <View style={styles.zoomContainerLandscape}>
                <Pressable style={styles.zoomBtn}><Ionicons name="add" size={24} color="#fff" /></Pressable>
                <View style={styles.zoomLevel}><Text style={styles.zoomText}>1.0x</Text></View>
                <Pressable style={styles.zoomBtn}><Ionicons name="remove" size={24} color="#fff" /></Pressable>
            </View>

            <Pressable style={styles.cameraBtnOuter} onPress={handleCapture} disabled={uploading}>
                <View style={styles.cameraBtnInner}>
                    {uploading ? (
                    <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#1e6bd6" />
                        {burstCount > 0 && <Text style={styles.burstText}>{burstCount}/5</Text>}
                    </View>
                    ) : (
                    <MaterialCommunityIcons name="camera-iris" size={40} color="#0b2447" />
                    )}
                </View>
            </Pressable>

            <Pressable style={styles.galleryBtn} onPress={handlePickFromGallery} disabled={uploading}>
                <Ionicons name="images-outline" size={24} color="#fff" />
            </Pressable>

            {/* Bottom Right Info Box */}
            <View style={styles.angleInfoBox}>
                <Text style={styles.angleInfoLabel}>{currentAngle.label}</Text>
                <View style={styles.angleInfoPreview}>
                    <Image
                        source={currentAngle.outline}
                        style={styles.angleInfoOutline}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.angleInfoMandatory}>
                    {currentAngle.mandatory ? 'Mandatory' : 'Non-mandatory'}
                </Text>
            </View>

            <Pressable style={styles.nextPreviewBoxLandscape} onPress={nextAngle ? handleNext : handleFinish}>
                <Ionicons name={nextAngle ? "chevron-forward" : "checkmark-done"} size={32} color="#fff" />
                <Text style={styles.nextActionTextLandscape}>{nextAngle ? 'NEXT' : 'FINISH'}</Text>
            </Pressable>
        </View>
      </CameraView>
=======
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
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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
<<<<<<< HEAD
  mainCarOutlineLandscape: {
      width: '100%',
      height: '100%',
      opacity: 0.8
  },
  capturedImg: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
  },

  angleSelectorContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 120, // Leave room for right controls
      height: 100,
      zIndex: 10
  },
  angleListContent: {
      paddingHorizontal: (SCREEN_H - 120 - 110) / 2, // Centering logic for landscape (width becomes height)
      alignItems: 'center'
  },
  angleItem: {
      width: 100,
      height: 80,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  angleItemActive: {
      borderColor: '#1e6bd6',
      borderWidth: 2,
      backgroundColor: 'rgba(30,107,214,0.2)'
  },
  checkBadge: { position: 'absolute', top: -5, right: -5, zIndex: 5, backgroundColor: '#fff', borderRadius: 10 },
  angleMiniPreview: {
      width: 60,
      height: 40,
      marginBottom: 5
  },
  miniOutlineImg: {
      width: '100%',
      height: '100%'
  },
  angleItemLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 10,
      fontWeight: '700'
  },
  angleItemLabelActive: {
      color: '#fff'
  },

  rightControlsLandscape: {
      position: 'absolute',
      right: 20,
      top: 0,
      bottom: 0,
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      zIndex: 10
  },
  cameraBtnOuter: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: 'rgba(30,107,214,0.3)',
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center'
  },
  cameraBtnInner: {
      width: 60,
      height: 60,
      backgroundColor: '#fff',
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center'
  },

  zoomContainerLandscape: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 25,
      padding: 6,
      alignItems: 'center',
      gap: 10
  },
  zoomBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center'
  },
  zoomLevel: {
      paddingVertical: 4
  },
  zoomText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700'
  },
  galleryBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center'
  },

  nextPreviewBoxLandscape: {
      alignItems: 'center',
      marginTop: 20
  },
  nextActionTextLandscape: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '800',
      marginTop: 4
  },
  burstText: { fontSize: 10, color: '#1e6bd6', fontWeight: 'bold', marginTop: 2 },

  angleInfoBox: {
      alignItems: 'center',
      marginTop: 'auto',
      marginBottom: 10,
  },
  angleInfoLabel: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 5,
  },
  angleInfoPreview: {
      width: 60,
      height: 40,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
  },
  angleInfoOutline: {
      width: '80%',
      height: '80%',
      tintColor: 'rgba(255,255,255,0.6)'
  },
  angleInfoMandatory: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 9,
      fontWeight: '700'
=======
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
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  },
});
