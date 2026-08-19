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
import { DeviceMotion } from 'expo-sensors';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { uploadFile } from '../api';
import { logger } from '../utils/logger';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ImagePicker from 'expo-image-picker';
import { VEHICLE_CONFIGS } from '../constants/vehicleConfigs';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CATEGORIES = ['Exterior', 'Interior', 'Detail', 'Custom'];

const getGuidanceConfig = (carType: string) => {
  const config = VEHICLE_CONFIGS[carType] || VEHICLE_CONFIGS.sedan;
  const { outlines } = config;

  return {
    Exterior: [
      { id: 'front', label: 'Front', instruction: 'Capture the front view of the vehicle clearly.', outline: outlines.Exterior[0], mandatory: false },
      { id: 'frontLeft45', label: 'Front Left 45°', instruction: 'Capture from the front-left corner at a 45-degree angle.', outline: outlines.Exterior[1], mandatory: false },
      { id: 'leftSide', label: 'Left Side', instruction: 'Capture the full left side profile of the vehicle.', outline: outlines.Exterior[2], mandatory: false },
      { id: 'rearLeft45', label: 'Rear Left 45°', instruction: 'Capture from the rear-left corner at a 45-degree angle.', outline: outlines.Exterior[3], mandatory: false },
      { id: 'rear', label: 'Rear', instruction: 'Capture the full rear view of the vehicle.', outline: outlines.Exterior[4], mandatory: false },
      { id: 'rearRight45', label: 'Rear Right 45°', instruction: 'Capture from the rear-right corner at a 45-degree angle.', outline: outlines.Exterior[5], mandatory: false },
      { id: 'rightSide', label: 'Right Side', instruction: 'Capture the full right side profile of the vehicle.', outline: outlines.Exterior[6], mandatory: false },
      { id: 'frontRight45', label: 'Front Right 45°', instruction: 'Capture from the front-right corner at a 45-degree angle.', outline: outlines.Exterior[7], mandatory: false },
    ],
    Interior: [
      { id: 'odometer', label: 'Dashboard/Odometer', instruction: 'Capture a clear photo of the dashboard and odometer reading.', outline: outlines.Interior[0], mandatory: false },
      { id: 'steering', label: 'Steering Wheel', instruction: 'Capture the steering wheel and instrument cluster.', outline: outlines.Interior[1], mandatory: false },
      { id: 'console', label: 'Center Console', instruction: 'Capture the gear lever and center console area.', outline: outlines.Interior[2], mandatory: false },
      { id: 'frontSeats', label: 'Front Seats', instruction: 'Capture the condition of the front seats.', outline: outlines.Interior[3], mandatory: false },
      { id: 'rearSeats', label: 'Rear Seats', instruction: 'Capture the condition of the rear passenger seats.', outline: outlines.Interior[4], mandatory: false },
      { id: 'roof', label: 'Roof/Sunroof', instruction: 'Capture the interior roof liner and sunroof if available.', outline: outlines.Interior[5], mandatory: false },
      { id: 'doorPads', label: 'Door Pads', instruction: 'Capture the condition of the door trims.', outline: outlines.Interior[6], mandatory: false },
      { id: 'bootSpace', label: 'Boot/Trunk Space', instruction: 'Capture the trunk area with the boot open.', outline: outlines.Interior[7], mandatory: false },
    ],
    Detail: [
      { id: 'engineBay', label: 'Engine Bay', instruction: 'Capture the engine compartment with the hood open.', outline: outlines.Detail[0], mandatory: false },
      { id: 'frontLeftTyre', label: 'Front Left Tyre', instruction: 'Capture the front left tyre tread and rim.', outline: outlines.Detail[1], mandatory: false },
      { id: 'frontRightTyre', label: 'Front Right Tyre', instruction: 'Capture the front right tyre tread and rim.', outline: outlines.Detail[2], mandatory: false },
      { id: 'rearLeftTyre', label: 'Rear Left Tyre', instruction: 'Capture the rear left tyre tread and rim.', outline: outlines.Detail[3], mandatory: false },
      { id: 'rearRightTyre', label: 'Rear Right Tyre', instruction: 'Capture the rear right tyre tread and rim.', outline: outlines.Detail[4], mandatory: false },
      { id: 'spareTyre', label: 'Spare Tyre', instruction: 'Capture the spare wheel and tool kit.', outline: outlines.Detail[5], mandatory: false },
      { id: 'batteryVIN', label: 'Battery/VIN', instruction: 'Capture the battery and VIN plate clearly.', outline: outlines.Detail[6], mandatory: false },
      { id: 'undercarriage', label: 'Undercarriage', instruction: 'Capture the bottom view/chassis if possible.', outline: outlines.Detail[7], mandatory: false },
    ],
    Custom: [
      { id: 'custom', label: 'Custom', instruction: 'Click here to upload Car\'s Custom Images', outline: outlines.Custom[0], mandatory: false },
    ]
  };
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
  const [isStable, setIsStable] = useState(false);
  const [isPerfect, setIsPerfect] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState('Align your car');
  const [burstCount, setBurstCount] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const guidanceConfig = getGuidanceConfig(selectedType);
  const currentAngles = guidanceConfig[selectedCategory] || guidanceConfig.Exterior;
  const currentAngle = currentAngles[selectedAngleIndex] || currentAngles[0];

  // Sensor Logic
  useEffect(() => {
    let subscription: any;

    const startSensors = async () => {
      const { status } = await DeviceMotion.requestPermissionsAsync();
      if (status !== 'granted') return;

      const handleMotionData = (data: any) => {
        if (!data.rotation) return;

        const { beta, gamma } = data.rotation;
        const { alpha: rA, beta: rB, gamma: rC } = data.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

        // 1. Angle Detection (Radians)
        const pitchDeg = (beta * 180) / Math.PI;
        const rollDeg = (gamma * 180) / Math.PI;

        // Tolerance: +/- 10 degrees
        const isPitchOk = pitchDeg > 75 && pitchDeg < 105;
        const isRollOk = Math.abs(rollDeg) < 10;
        const correctAngle = isPitchOk && isRollOk;

        setIsAngleCorrect(correctAngle);

        // 2. Stability Detection
        const movement = Math.abs(rA) + Math.abs(rB) + Math.abs(rC);
        const stable = movement < 0.2; // Threshold for "Steady"
        setIsStable(stable);

        // 2.5 Stability Timer Logic
        if (correctAngle && stable) {
          if (!stabilityTimerRef.current && !isPerfect) {
            stabilityTimerRef.current = setTimeout(() => {
              setIsPerfect(true);
              setGuidanceMessage('Perfect Angle – Ready!');
            }, 1000);
          }
        } else {
          if (stabilityTimerRef.current) {
            clearTimeout(stabilityTimerRef.current);
            stabilityTimerRef.current = null;
          }
          setIsPerfect(false);
        }

        // 3. Guidance Messaging
        if (!isPitchOk) {
          setGuidanceMessage(pitchDeg < 75 ? 'Tilt phone forward' : 'Tilt phone backward');
        } else if (!isRollOk) {
          setGuidanceMessage('Level the phone');
        } else if (!stable) {
          setGuidanceMessage('Hold Steady...');
        } else if (!isPerfect) {
          setGuidanceMessage('Keep holding...');
        }
      };

      // Safety check for Web: Some environments don't support DeviceMotion.addListener
      if (typeof DeviceMotion.addListener === 'function') {
        try {
          subscription = DeviceMotion.addListener(handleMotionData);
        } catch (e) {
          logger.warn('DeviceMotion.addListener failed, falling back to window event:', e);
          setupWebFallback();
        }
      } else {
        setupWebFallback();
      }

      function setupWebFallback() {
        if (Platform.OS === 'web') {
          const webHandler = (event: DeviceMotionEvent) => {
            // Map Web event to Expo format
            const data = {
              rotation: {
                alpha: (event.rotationRate?.alpha || 0) * (Math.PI / 180),
                beta: (event.accelerationIncludingGravity?.y || 0) * (Math.PI / 180), // Rough mapping for pitch
                gamma: (event.accelerationIncludingGravity?.x || 0) * (Math.PI / 180), // Rough mapping for roll
              },
              rotationRate: event.rotationRate,
            };
            handleMotionData(data);
          };
          window.addEventListener('devicemotion', webHandler);
          subscription = { remove: () => window.removeEventListener('devicemotion', webHandler) };
        }
      }

      DeviceMotion.setUpdateInterval(100);
    };

    if (isFocused) {
      startSensors();
    }

    return () => {
      subscription?.remove();
    };
  }, [isFocused, selectedAngleIndex, selectedCategory]);

  // Screen Orientation
  useEffect(() => {
    async function changeOrientation() {
      if (Platform.OS === 'web') return;
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
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      }
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
    Object.keys(guidanceConfig).forEach(cat => {
        guidanceConfig[cat].forEach((angle: any) => {
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
      capturedImagesStatus: capturedImages, // Added to track which angles were captured
    };
    navigation.navigate('InspectionReport', { listingData: updatedListingData });
  };

  const handleBack = () => {
    if (selectedAngleIndex > 0) {
      setSelectedAngleIndex(selectedAngleIndex - 1);
    } else {
      const catIdx = CATEGORIES.indexOf(selectedCategory);
      if (catIdx > 0) {
        const prevCat = CATEGORIES[catIdx - 1];
        setSelectedCategory(prevCat);
        setSelectedAngleIndex(getGuidanceConfig(selectedType)[prevCat].length - 1);
      } else {
        navigation.goBack();
      }
    }
  };

  const nextAngle = selectedAngleIndex < currentAngles.length - 1
    ? currentAngles[selectedAngleIndex + 1]
    : (CATEGORIES.indexOf(selectedCategory) < CATEGORIES.length - 1 ? getGuidanceConfig(selectedType)[CATEGORIES[CATEGORIES.indexOf(selectedCategory) + 1]][0] : null);

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

      {/* Green/Orange/Red Guide Box - Edge to Edge */}
      <View style={[
          styles.edgeGuideBox,
          {
            top: Math.max(insets.top, 10),
            left: Math.max(insets.left, 10),
            right: Math.max(insets.right, 10),
            bottom: Math.max(insets.bottom, 10)
          },
          isPerfect ? styles.edgeGuideBoxGreen : (isAngleCorrect ? styles.edgeGuideBoxOrange : styles.edgeGuideBoxRed),
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
              {isAngleCorrect ? guidanceMessage : currentAngle.instruction}
            </Text>
            {!isAngleCorrect && (
               <Text style={[styles.subInstruction, { color: '#ff4444' }]}>
                  {guidanceMessage}
               </Text>
            )}
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
                    tintColor={isPerfect ? "#22c55e" : (isAngleCorrect ? "#fb923c" : "rgba(255,255,255,0.4)")}
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

          <Pressable
            style={[styles.cameraBtnOuter, isPerfect && styles.cameraBtnOuterPerfect]}
            onPress={handleCapture}
            disabled={uploading}
          >
              <View style={[styles.cameraBtnInner, isPerfect && styles.cameraBtnInnerPerfect]}>
                  {uploading ? (
                  <View style={{ alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#1e6bd6" />
                      {burstCount > 0 && <Text style={styles.burstText}>{burstCount}/5</Text>}
                  </View>
                  ) : (
                  <MaterialCommunityIcons
                    name="camera-iris"
                    size={40}
                    color={isPerfect ? "#fff" : "#0b2447"}
                  />
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
      borderWidth: 4,
      backgroundColor: 'rgba(34,197,94,0.1)',
  },
  edgeGuideBoxOrange: {
      borderColor: '#fb923c',
      borderWidth: 2.5,
      backgroundColor: 'rgba(251,146,60,0.05)',
  },
  edgeGuideBoxRed: {
      borderColor: '#ef4444',
      borderWidth: 1.5,
      backgroundColor: 'rgba(239,68,68,0.02)',
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
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
  },
  cameraBtnOuterPerfect: {
      backgroundColor: 'rgba(34,197,94,0.4)',
      transform: [{ scale: 1.1 }],
  },
  cameraBtnInner: {
      width: 60,
      height: 60,
      backgroundColor: '#fff',
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center'
  },
  cameraBtnInnerPerfect: {
      backgroundColor: '#22c55e',
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
