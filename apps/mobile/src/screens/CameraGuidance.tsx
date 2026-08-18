import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import * as ScreenOrientation from 'expo-screen-orientation';
import ScreenWrapper from '../components/ScreenWrapper';
import { logger } from '../utils/logger';
import { getStorageItem, setStorageItem } from '../utils/storage-utils';
import { VEHICLE_CONFIGS } from '../constants/vehicleConfigs';

const STORAGE_KEYS = {
  HAS_SEEN_TOUR: 'CAMERA_GUIDANCE_HAS_SEEN_TOUR',
  SESSION_STATE: 'CAMERA_GUIDANCE_SESSION_STATE',
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const VEHICLE_TYPES = Object.values(VEHICLE_CONFIGS).map(v => ({
  id: v.id,
  name: v.name,
  image: v.previewImage
}));

const CATEGORIES = ['Exterior', 'Interior', 'Detail', 'Custom'];

export default function CameraGuidance() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CameraGuidance'>>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { listingData } = (route.params as any) || {};

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(listingData?.carType || 'sedan');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load state from storage
  useEffect(() => {
    async function loadState() {
      const session = await getStorageItem<any>(STORAGE_KEYS.SESSION_STATE, null);
      if (session) {
        setStep(session.step || 0);
        if (!listingData?.carType) {
          setSelectedType(session.selectedType || 'sedan');
        }
      }
      setHasLoaded(true);
    }
    loadState();
  }, []);

  // Persist session state
  useEffect(() => {
    if (hasLoaded) {
      setStorageItem(STORAGE_KEYS.SESSION_STATE, { step, selectedType });
    }
  }, [step, selectedType, hasLoaded]);

  useEffect(() => {
    async function changeOrientation() {
      // Screen orientation locking is often not supported or restricted on Web
      if (Platform.OS === 'web') return;

      try {
        if (isFocused && step >= 2) {
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
  }, [isFocused, step]);

  const handleNext = async () => {
    logger.log('CameraGuidance: handleNext called, current step:', step);
    if (step === 0) {
      const hasSeenTour = await getStorageItem(STORAGE_KEYS.HAS_SEEN_TOUR, false);
      if (hasSeenTour) {
        handleSkip();
        return;
      }
    }

    if (step < 6) {
      setStep(step + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = async () => {
    await setStorageItem(STORAGE_KEYS.HAS_SEEN_TOUR, true);
    await setStorageItem(STORAGE_KEYS.SESSION_STATE, null); // Clear session on finish
    navigation.navigate('CarCamera', { listingData: { ...listingData, carType: selectedType } });
  };

  const renderTourHeader = () => {
    if (step === 0) return null;
    return (
      <View style={[
        step >= 2 ? styles.tourHeaderLandscape : styles.tourHeader,
        {
          top: Math.max(insets.top, 20),
          left: Math.max(insets.left, step >= 2 ? 40 : 20),
          right: Math.max(insets.right, step >= 2 ? 40 : 20)
        }
      ]}>
        <Text style={styles.tourProgress}>Quick tour {step} of 6</Text>
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    );
  };

  const renderCategorySelector = (activeCat: string) => {
    return (
      <View style={styles.categoryBarTour}>
        {CATEGORIES.map((cat) => (
          <View key={cat} style={[styles.categoryTabTour, activeCat === cat && styles.categoryTabActiveTour]}>
             {activeCat === cat && (
               <View style={styles.activeDot} />
             )}
             <Text style={[styles.categoryTabTextTour, activeCat === cat && styles.categoryTabTextActiveTour]}>
               {cat}
             </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.titleRow}>
               <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
               </View>
               <Text style={styles.titleText}>Choose Your Car Type</Text>
            </View>

            <Text style={styles.label}>Vehicle Type</Text>

            <View style={styles.grid}>
                {VEHICLE_TYPES.map((item) => (
                    <Pressable
                        key={item.id}
                        onPress={() => setSelectedType(item.id)}
                        style={[
                            styles.typeCardNew,
                            selectedType === item.id && styles.typeCardActiveNew
                        ]}
                    >
                        <View style={styles.imageWrapperNew}>
                             <Image source={item.image} style={styles.typeImageNew} resizeMode="contain" />
                        </View>
                        <Text style={styles.typeLabelNew}>{item.name}</Text>
                    </Pressable>
                ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        );
      case 1: // Tour 1/6: Swipe Guide (Portrait)
        return (
          <View style={styles.swipeGuideContainer}>
            {renderTourHeader()}
            <Text style={styles.instructionTextLarge}>
              Swipe left or right to change the car angle to upload appropriate image
            </Text>
            <View style={styles.gestureContainer}>
               <Ionicons name="arrow-back" size={40} color="#fff" />
               <View style={styles.handWrapper}>
                  <View style={styles.touchCircle} />
                  <MaterialCommunityIcons name="hand-pointing-up" size={80} color="#fff" />
               </View>
               <Ionicons name="arrow-forward" size={40} color="#fff" />
            </View>

            <Pressable
              style={[styles.nextBtnOverlayPortrait, { bottom: 60 + insets.bottom }]}
              onPress={handleNext}
              hitSlop={30}
            >
              <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 2: // Tour 2/6: Fit Borders (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            <View style={styles.overlayContent}>
                <Text style={styles.instructionTextOverlay}>Try to Fit your Car inside borders</Text>
                <View style={styles.outlineCenter}>
                   <Ionicons name="arrow-forward" size={40} color="#fff" style={styles.inwardArrowLeft} />
                   <Image
                      source={VEHICLE_CONFIGS[selectedType]?.outlines.Exterior[0]}
                      style={styles.mainOutlineBig}
                      tintColor="#fff"
                      resizeMode="contain"
                    />
                   <Ionicons name="arrow-back" size={40} color="#fff" style={styles.inwardArrowRight} />
                </View>
            </View>
            <Pressable
              style={[styles.nextBtnOverlayLandscape, { bottom: 40 + insets.bottom, right: 60 + insets.right }]}
              onPress={handleNext}
              hitSlop={30}
            >
                <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 3: // Tour 3/6: Green Click (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            <View style={styles.fullGreenBorder} />
            <View style={styles.overlayContent}>
                <Text style={styles.instructionTextOverlay}>To Click photo in best angles Click when green</Text>
                <View style={styles.outlineCenter}>
                    <Ionicons name="arrow-back" size={40} color="#fff" style={styles.sideArrowLeft} />
                    <View style={{ width: 400, height: 180 }} />
                    <Ionicons name="arrow-forward" size={40} color="#fff" style={styles.sideArrowRight} />
                </View>
            </View>

            <Pressable
              style={[styles.nextBtnOverlayLandscape, { bottom: 40 + insets.bottom, right: 60 + insets.right }]}
              onPress={handleNext}
              hitSlop={30}
            >
                <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 4: // Tour 4/6: Interior Guidance (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            {renderCategorySelector('Interior')}
            <View style={styles.overlayContent}>
                <Ionicons name="arrow-up" size={40} color="#fff" style={styles.pointingArrow} />
                <Text style={styles.instructionTextOverlayLarge}>Click here to upload Car's interior Images</Text>
            </View>
            <Pressable
              style={[styles.nextBtnOverlayLandscape, { bottom: 40 + insets.bottom, right: 60 + insets.right }]}
              onPress={handleNext}
              hitSlop={30}
            >
                <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 5: // Tour 5/6: Detail Guidance (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            {renderCategorySelector('Detail')}
            <View style={styles.overlayContent}>
                <Ionicons name="arrow-up" size={40} color="#fff" style={styles.pointingArrow} />
                <Text style={styles.instructionTextOverlayLarge}>Click here to upload Car's Detail Images</Text>
            </View>
            <Pressable
              style={[styles.nextBtnOverlayLandscape, { bottom: 40 + insets.bottom, right: 60 + insets.right }]}
              onPress={handleNext}
              hitSlop={30}
            >
                <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 6: // Tour 6/6: Custom Guidance (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            {renderCategorySelector('Custom')}
            <View style={styles.overlayContent}>
                <Ionicons name="arrow-up" size={40} color="#fff" style={styles.pointingArrow} />
                <Text style={styles.instructionTextOverlayLarge}>Click here to upload Car's Custom Images</Text>
            </View>
            <Pressable
              style={[styles.nextBtnOverlayLandscape, { bottom: 40 + insets.bottom, right: 60 + insets.right }]}
              onPress={handleNext}
              hitSlop={30}
            >
                <Text style={styles.nextBtnText}>FINISH {'>'}</Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };


  return (
    <ScreenWrapper
      style={styles.container}
      backgroundColor="#0a0d14"
      edges={[]}
    >
        <View style={styles.content}>
            {renderStepContent()}
        </View>

        {step === 0 && (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={handleNext}
                  style={styles.nextBtn}
                  hitSlop={30}
                >
                    <Text style={styles.footerText}>NEXT</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </Pressable>
            </View>
        )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0d14' },
  content: { flex: 1 },

  stepContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 40 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e6bd6', alignItems: 'center', justifyContent: 'center' },
  titleText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  label: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCardNew: {
    width: (SCREEN_W - 50) / 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  typeCardActiveNew: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' },
  imageWrapperNew: { width: '100%', height: 60, alignItems: 'center', justifyContent: 'center' },
  typeImageNew: { width: '100%', height: '100%' },
  typeLabelNew: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 8 },

  tourHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
  tourHeaderLandscape: { position: 'absolute', top: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
  tourProgress: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' },
  skipBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  skipText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  swipeGuideContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  instructionTextLarge: { color: '#fff', fontSize: 22, textAlign: 'center', fontWeight: '500', paddingHorizontal: 40, lineHeight: 32, marginBottom: 40 },
  gestureContainer: { flexDirection: 'row', alignItems: 'center', gap: 30, marginBottom: 40 },
  handWrapper: { position: 'relative', alignItems: 'center' },
  touchCircle: { position: 'absolute', top: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)' },

  guidanceOverlayLandscape: { flex: 1, backgroundColor: '#000' },
  overlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionTextOverlay: { color: '#fff', fontSize: 20, textAlign: 'center', fontWeight: '500', marginBottom: 40 },
  instructionTextOverlayLarge: { color: '#fff', fontSize: 24, textAlign: 'center', fontWeight: '500', width: '60%' },
  outlineCenter: { width: 500, height: 220, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  mainOutlineBig: { width: 350, height: 180, opacity: 0.8 },
  inwardArrowLeft: { marginRight: 20 },
  inwardArrowRight: { marginLeft: 20 },
  sideArrowLeft: { position: 'absolute', left: 20 },
  sideArrowRight: { position: 'absolute', right: 20 },
  pointingArrow: { marginBottom: 20 },

  fullGreenBorder: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, borderWidth: 4, borderColor: '#22c55e', borderRadius: 16, zIndex: 10 },

  categoryBarTour: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
    padding: 4,
    gap: 10,
    zIndex: 10
  },
  categoryTabTour: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryTabActiveTour: { backgroundColor: 'transparent' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1e6bd6' },
  categoryTabTextTour: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  categoryTabTextActiveTour: { color: '#fff' },

  nextBtnOverlayPortrait: { position: 'absolute', bottom: 60, right: 40, zIndex: 1000 },
  nextBtnOverlayLandscape: { position: 'absolute', bottom: 40, right: 60, zIndex: 1000 },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0d14',
    zIndex: 1000
  },
  footerText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1e6bd6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});

