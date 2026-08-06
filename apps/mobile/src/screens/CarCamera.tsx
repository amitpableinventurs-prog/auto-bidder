import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { uploadFile } from '../api';
import { logger } from '../utils/logger';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CATEGORIES = ['Exterior', 'Interior', 'Detail', 'Custom'];

const GUIDANCE_CONFIG: Record<string, any> = {
  Exterior: [
    { id: 'front', label: 'Front', instruction: 'Try to Fit your Car inside borders', outline: require('../../assets/Satate=1, Name=Exterior.png'), mandatory: false },
    { id: 'leftFront', label: 'Left Front 45°', instruction: 'To Click photo in best angles\nClick when green', outline: require('../../assets/Satate=2, Name=Exterior.png'), mandatory: false },
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
};

export default function CarCamera() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CarCamera'>>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { listingData } = (route.params as any) || {};

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const angleListRef = useRef<FlatList>(null);

  const [selectedType, setSelectedType] = useState(listingData?.carType || 'sedan');
  const [selectedCategory, setSelectedCategory] = useState('Exterior');
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);

  const [capturedImages, setCapturedImages] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState(false);
  const [isAngleCorrect, setIsAngleCorrect] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const currentAngles = GUIDANCE_CONFIG[selectedCategory] || GUIDANCE_CONFIG.Exterior;
  const currentAngle = currentAngles[selectedAngleIndex] || currentAngles[0];

  // Screen Orientation
  useEffect(() => {
    async function changeOrientation() {
      try {
        if (isFocused) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch (error) {
        logger.warn('Orientation lock failed:', error);
      }
    }
    changeOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, [isFocused]);

  // Sync FlatList on index change
  useEffect(() => {
    if (currentAngles.length > 0 && selectedAngleIndex >= 0 && selectedAngleIndex < currentAngles.length) {
        // Use a small timeout to ensure the FlatList has updated its internal data
        const timer = setTimeout(() => {
            try {
                angleListRef.current?.scrollToIndex({
                    index: selectedAngleIndex,
                    animated: true,
                    viewPosition: 0.5
                });
            } catch (e) {
                // Ignore scroll errors if list is still rendering
            }
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [selectedAngleIndex, selectedCategory]);

  // Mock angle detection
  useEffect(() => {
    setIsAngleCorrect(false);
    const timer = setTimeout(() => {
      setIsAngleCorrect(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [selectedAngleIndex, selectedCategory]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: '#1e6bd6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || uploading) {
        if (!isCameraReady) Alert.alert('Wait', 'Camera is not ready yet.');
        return;
    }

    const key = `${selectedCategory}_${currentAngle.id}`;
    let photoUri: string | null = null;

    try {
      // 1. Instant Shutter Feedback
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        shutterSound: true,
      });

      if (photo?.uri) {
        photoUri = photo.uri;
        logger.log('Photo captured locally:', photoUri);

        // 2. Immediate Local Preview (Non-blocking)
        setCapturedImages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), photoUri!]
        }));

        // 3. Move to next angle immediately
        handleNext();

        // 4. Background Upload
        uploadFile(photoUri, 'image/jpeg', `captured_${key}_${Date.now()}.jpg`)
          .then(({ url }) => {
            logger.log('Background upload success:', url);
            // Replace local URI with server URL
            setCapturedImages(prev => ({
              ...prev,
              [key]: prev[key].map(uri => uri === photoUri ? url : uri)
            }));
          })
          .catch(err => {
            logger.error('Background upload failed:', err.message);
            // Optionally notify user or mark as failed in UI
          });

      } else {
        Alert.alert('Error', 'Could not capture photo.');
      }
    } catch (error: any) {
      logger.error('Capture Process Error:', error.message);
      Alert.alert('Error', 'Camera capture failed. Please try again.');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.6,
      });
      if (!result.canceled && result.assets.length > 0) {
        setUploading(true);
        for (const asset of result.assets) {
          const key = `${selectedCategory}_${currentAngle.id}`;
          const { url } = await uploadFile(asset.uri, 'image/jpeg', `picked_${key}_${Date.now()}.jpg`);
          setCapturedImages(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), url]
          }));
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to pick images from gallery.');
    } finally {
      setUploading(false);
    }
  };

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
            'Incomplete',
            'Please capture the following mandatory photos:\n\n' + missingMandatory.join('\n'),
            [{ text: 'OK' }]
        );
        return;
    }

    const allUrls = Object.values(capturedImages).flat();
    const updatedListingData = {
      ...listingData,
      images: [...(listingData?.images || []), ...allUrls],
      imageUrl: allUrls[0] || listingData?.imageUrl,
      carType: selectedType,
    };
    navigation.navigate('ListingDocuments', { listingData: updatedListingData });
  };

  const handleBack = () => {
    if (selectedAngleIndex > 0) {
      setSelectedAngleIndex(selectedAngleIndex - 1);
    } else {
      const catIdx = CATEGORIES.indexOf(selectedCategory);
      if (catIdx > 0) {
        const prevCat = CATEGORIES[catIdx - 1];
        setSelectedCategory(prevCat);
        setSelectedAngleIndex(GUIDANCE_CONFIG[prevCat].length - 1);
      } else {
        navigation.goBack();
      }
    }
  };

  const nextAngle = selectedAngleIndex < currentAngles.length - 1
    ? currentAngles[selectedAngleIndex + 1]
    : (CATEGORIES.indexOf(selectedCategory) < CATEGORIES.length - 1 ? GUIDANCE_CONFIG[CATEGORIES[CATEGORIES.indexOf(selectedCategory) + 1]][0] : null);

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        ref={cameraRef}
        onCameraReady={() => {
            logger.log('Camera is ready');
            setIsCameraReady(true);
        }}
        onMountError={(error) => {
            logger.error('Camera mount error:', error.message);
            Alert.alert('Camera Error', 'Failed to start camera: ' + error.message);
        }}
      />

      <View style={[styles.darkenLayer, { pointerEvents: 'none' }]} />

      {/* Green Guide Box - Edge to Edge */}
      <View style={[
          styles.edgeGuideBox,
          {
            top: Math.max(insets.top, 10),
            left: Math.max(insets.left, 10),
            right: Math.max(insets.right, 10),
            bottom: Math.max(insets.bottom, 10)
          },
          isAngleCorrect && styles.edgeGuideBoxGreen,
          { pointerEvents: 'none' }
      ]} />

      {/* Top Controls */}
      <View style={[styles.topControls, {
        top: Math.max(insets.top, 20),
        left: Math.max(insets.left, 20),
        right: Math.max(insets.right, 20)
      }]}>
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
      <View style={[styles.centerContentLandscape, { pointerEvents: 'none' }]}>
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
              {currentAngle.outline ? (
                 <Image
                    source={currentAngle.outline}
                    style={[
                      styles.mainCarOutlineLandscape,
                      selectedCategory !== 'Exterior' && { transform: [{ scale: 1.4 }] }
                    ]}
                    tintColor={isAngleCorrect ? "#22c55e" : "rgba(255,255,255,0.4)"}
                    resizeMode="contain"
                  />
              ) : (
                <MaterialCommunityIcons name="camera-outline" size={120} color="rgba(255,255,255,0.2)" />
              )}
            </>
          )}
        </View>
      </View>

      {/* Sliding Angle Selector (Bottom) */}
      <View style={[styles.angleSelectorContainer, { bottom: Math.max(insets.bottom, 20), left: Math.max(insets.left, 20), right: 140 + insets.right }]}>
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
                              style={styles.miniOutlineImg}
                              tintColor={selectedAngleIndex === index ? "#fff" : "rgba(255,255,255,0.3)"}
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
      <View style={[styles.rightControlsLandscape, { right: Math.max(insets.right, 10), paddingBottom: insets.bottom, paddingTop: insets.top }]}>
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
                      tintColor="rgba(255,255,255,0.6)"
                      resizeMode="contain"
                  />
              </View>
              <Text style={styles.angleInfoMandatory}>
                  {currentAngle.mandatory ? 'Mandatory' : 'Non-mandatory'}
              </Text>
          </View>

          <Pressable style={styles.nextBtnOverlayLandscape} onPress={nextAngle ? handleNext : handleFinish}>
              <Text style={styles.nextBtnText}>{nextAngle ? 'NEXT >' : 'FINISH >'}</Text>
          </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkenLayer: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)' },

  edgeGuideBox: {
      position: 'absolute',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.2)',
      borderRadius: 16,
      zIndex: 1
  },
  edgeGuideBoxGreen: {
      borderColor: '#22c55e',
      borderWidth: 3,
      backgroundColor: 'rgba(34,197,94,0.05)',
  },

  topControls: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10
  },
  iconBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center'
  },

  categoryBarLandscape: {
      flexDirection: 'row',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 25,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 5
  },
  categoryTab: {
      paddingHorizontal: 15,
      paddingVertical: 6,
      borderRadius: 20,
  },
  categoryTabActive: {
      backgroundColor: '#1e6bd6',
  },
  categoryTabText: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 14,
      fontWeight: '700'
  },
  categoryTabTextActive: {
      color: '#fff'
  },

  centerContentLandscape: {
      position: 'absolute',
      top: 40,
      bottom: 100,
      left: 20,
      right: 100,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
  },
  instructionWrap: {
      position: 'absolute',
      top: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      zIndex: 5
  },
  instructionText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '600',
  },

  outlineWrapperLandscape: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  mainCarOutlineLandscape: {
      width: '95%',
      height: '95%',
      transform: [{ scale: 1.25 }],
      opacity: 0.9
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
      right: 140, // Increased margin to leave more room for right controls
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
      width: 100,
      justifyContent: 'space-around', // Use space-around for better distribution
      alignItems: 'center',
      zIndex: 20
  },
  cameraBtnOuter: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: 'rgba(30,107,214,0.3)',
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10, // Ensure gap from others
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

  nextBtnOverlayLandscape: {
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: 'rgba(30,107,214,0.2)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#1e6bd6',
  },
  nextBtnText: {
      color: '#1e6bd6',
      fontSize: 14,
      fontWeight: '900'
  },
  burstText: { fontSize: 10, color: '#1e6bd6', fontWeight: 'bold', marginTop: 2 },

  angleInfoBox: {
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 5,
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
  },
  angleInfoMandatory: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 9,
      fontWeight: '700'
  },
});
