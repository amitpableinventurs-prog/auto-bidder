<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
=======
import React from 'react';
import {
  Dimensions,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width: SCREEN_W } = Dimensions.get('window');

<<<<<<< HEAD
const VEHICLE_TYPES = [
  { id: 'sedan', name: 'Sedan', image: require('../../assets/Sedan.png') },
  { id: 'suv', name: 'SUV', image: require('../../assets/suv.png') },
  { id: 'hatchback', name: 'Hatchback', image: require('../../assets/Hatchback.png') },
  { id: 'pickup', name: 'Pickup', image: require('../../assets/pickups.png') },
  { id: 'luxury', name: 'Sports', image: require('../../assets/sport.png') },
  { id: 'van', name: 'Van', image: require('../../assets/utility.png') },
];

const CATEGORIES = ['Exterior', 'Interior', 'Detail', 'Custom'];

=======
const TIPS = [
  {
    icon: 'chevron-back-circle' as const,
    iconLib: 'ionicons' as const,
    text: 'Tap left or right arrows (or swipe) to change the car angle and capture the appropriate image.',
  },
  {
    icon: 'camera-outline' as const,
    iconLib: 'ionicons' as const,
    text: 'Tap the camera button when the green border lights up — that means the angle is perfect.',
  },
  {
    icon: 'images-outline' as const,
    iconLib: 'ionicons' as const,
    text: 'Use the Gallery icon to upload Interior, Detail, and Custom images all in one session.',
  },
];

>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
export default function CameraGuidance() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CameraGuidance'>>();
  const { listingData } = (route.params as any) || {};

<<<<<<< HEAD
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState('sedan');

  useEffect(() => {
    async function changeOrientation() {
      // Step 2, 3, 4 are Landscape
      if (isFocused && step >= 2) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }
    changeOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [isFocused, step]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    navigation.navigate('CarCamera', { listingData: { ...listingData, carType: selectedType } });
  };

  const renderTourHeader = () => {
    if (step === 0) return null;
    return (
      <View style={step >= 2 ? styles.tourHeaderLandscape : styles.tourHeader}>
        <Text style={styles.tourProgress}>Quick tour {step} of 4</Text>
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
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
                  <MaterialCommunityIcons name="camera-flip" size={24} color="#fff" />
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
                            styles.typeCard,
                            selectedType === item.id && styles.typeCardActive
                        ]}
                    >
                        <Text style={styles.typeLabel}>{item.name}</Text>
                        <View style={styles.imageWrapper}>
                             <Image source={item.image} style={styles.typeImage} resizeMode="contain" />
                        </View>
                    </Pressable>
                ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        );
      case 1: // Tour 1/4: Swipe Guide (Portrait)
        return (
          <View style={styles.swipeGuideContainer}>
            {renderTourHeader()}
            <Text style={styles.instructionTextLarge}>
              Swipe left or right to change the car angle to upload appropriate image
            </Text>
            <View style={styles.gestureContainer}>
               <Ionicons name="arrow-back" size={50} color="#fff" />
               <View style={styles.handWrapper}>
                  <View style={styles.touchCircle} />
                  <MaterialCommunityIcons name="hand-pointing-up" size={100} color="#fff" />
               </View>
               <Ionicons name="arrow-forward" size={50} color="#fff" />
            </View>

            <View style={styles.angleBoxContainer}>
               <View style={styles.angleBox}>
                  <Image source={require('../../assets/Satate=1, Name=Exterior.png')} style={styles.miniOutline} resizeMode="contain" />
                  <Text style={styles.angleLabel}>Front</Text>
               </View>
               <View style={styles.angleBox}>
                  <Image source={require('../../assets/Satate=2, Name=Exterior.png')} style={styles.miniOutline} resizeMode="contain" />
                  <Text style={styles.angleLabel}>Left Front 45°</Text>
               </View>
               <View style={styles.angleBox}>
                  <Image source={require('../../assets/Satate=3, Name=Exterior.png')} style={styles.miniOutline} resizeMode="contain" />
                  <Text style={styles.angleLabel}>Left Side 90°</Text>
               </View>
            </View>

            <Pressable style={styles.nextBtnOverlayPortrait} onPress={handleNext}>
              <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 2: // Tour 2/4: Fit Borders (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            <View style={styles.edgeGuideBoxMock} />
            <View style={styles.overlayContent}>
                <Text style={styles.instructionTextOverlay}>Try to Fit your Car inside borders</Text>
                <View style={styles.outlineCenter}>
                   <Image source={require('../../assets/Satate=1, Name=Exterior.png')} style={styles.mainOutlineBig} tintColor="#fff" />
                </View>
            </View>
            <Pressable style={styles.nextBtnOverlayLandscape} onPress={handleNext}>
                <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 3: // Tour 3/4: Green Click (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}
            <View style={styles.fullGreenBorder} />
            <View style={styles.overlayContent}>
                <Text style={styles.instructionTextOverlay}>To Click photo in best angles Click when green</Text>
                <View style={styles.outlineCenter}>
                    <Image source={require('../../assets/Satate=2, Name=Exterior.png')} style={styles.mainOutlineBig} tintColor="#22c55e" />
                </View>
            </View>

            {/* Mock Angle Info Box */}
            <View style={styles.angleInfoBoxMock}>
                <Text style={styles.angleInfoLabel}>Left Front 45°</Text>
                <View style={styles.angleInfoPreview}>
                    <Image source={require('../../assets/Satate=2, Name=Exterior.png')} style={styles.angleInfoOutline} resizeMode="contain" />
                </View>
                <Text style={styles.angleInfoMandatory}>Mandatory</Text>
            </View>

            {/* Mock Capture Button */}
            <View style={styles.mockRightControlsSimple}>
                <View style={styles.mockCameraBtnOuter}>
                  <View style={styles.mockCameraBtnInner}>
                    <MaterialCommunityIcons name="camera-iris" size={32} color="#0b2447" />
                  </View>
                </View>
            </View>

            <Pressable style={styles.nextBtnOverlayLandscape} onPress={handleNext}>
                <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
            </Pressable>
          </View>
        );
      case 4: // Tour 4/4: Combined (Landscape)
        return (
          <View style={styles.guidanceOverlayLandscape}>
            {renderTourHeader()}

            <View style={styles.categoryBarMock}>
                {CATEGORIES.map((cat, i) => (
                    <View key={cat} style={[styles.categoryTabMock, i === 0 && styles.categoryTabActiveMock]}>
                        <Text style={[styles.categoryTabTextMock, i === 0 && styles.categoryTabTextActiveMock]}>{cat}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.overlayContent}>
                <Text style={[styles.instructionTextOverlay, { marginTop: 40 }]}>Click here to upload Interior, Detailed or Custom Images</Text>

                <View style={styles.categoriesCombinedRow}>
                   <View style={styles.catBox}><Ionicons name="car" size={30} color="#fff" /><Text style={styles.catText}>Interior</Text></View>
                   <View style={styles.catBox}><Ionicons name="construct" size={30} color="#fff" /><Text style={styles.catText}>Detailed</Text></View>
                   <View style={styles.catBox}><Ionicons name="apps" size={30} color="#fff" /><Text style={styles.catText}>Custom</Text></View>
                </View>

                <Text style={styles.subInstructionText}>Total 25+ angles for a complete professional listing.</Text>
            </View>

            <Pressable style={styles.nextBtnOverlayLandscape} onPress={handleNext}>
                <Text style={styles.nextBtnText}>FINISH {'>'}</Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            {renderStepContent()}
=======
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        {/* Green frame preview */}
        <View style={styles.framePreview}>
          <MaterialCommunityIcons name="car-outline" size={SCREEN_W * 0.52} color="rgba(255,255,255,0.7)" />
          <View style={styles.greenBorder} />
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
        </View>
        <Text style={styles.title}>Camera Guide</Text>
        <Text style={styles.subtitle}>Follow these tips for the best photos</Text>
      </View>

      <View style={styles.tipsSection}>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Ionicons name={tip.icon as any} size={26} color="#22c55e" />
            </View>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipNumber}>Tip {i + 1}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.startBtn} onPress={() => navigation.navigate('CarCamera', { listingData })}>
        <Ionicons name="camera" size={20} color="#fff" />
        <Text style={styles.startBtnText}>START SHOOTING</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1 },
=======
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'space-between' },
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b

  topSection: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 24 },
  framePreview: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  greenBorder: {
    position: 'absolute',
    top: -12,
    left: -20,
    right: -20,
    bottom: -12,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 14,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },

  tipsSection: { paddingHorizontal: 24, gap: 16, paddingVertical: 10 },
  tipRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipTextWrap: { flex: 1 },
  tipNumber: { color: '#22c55e', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  tipText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 21 },

  startBtn: {
    margin: 24,
    marginBottom: 36,
    height: 54,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
<<<<<<< HEAD
  typeCardActive: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' },
  imageWrapper: { width: 140, height: '100%', alignItems: 'center', justifyContent: 'center' },
  typeImage: { width: '90%', height: '90%' },
  typeLabel: { color: '#fff', fontSize: 18, fontWeight: '600' },

  tourHeader: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
  tourHeaderLandscape: { position: 'absolute', top: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
  tourProgress: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' },
  skipBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  skipText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  swipeGuideContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  instructionTextLarge: { color: '#fff', fontSize: 20, textAlign: 'center', fontWeight: '500', paddingHorizontal: 40, lineHeight: 28, marginBottom: 20 },
  gestureContainer: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 40 },
  handWrapper: { position: 'relative', alignItems: 'center' },
  touchCircle: { position: 'absolute', top: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.4)' },

  angleBoxContainer: { flexDirection: 'row', gap: 15, marginTop: 20 },
  angleBox: { width: 80, height: 70, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 5 },
  miniOutline: { width: '80%', height: '60%' },
  angleLabel: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 4 },

  guidanceOverlayLandscape: { flex: 1, backgroundColor: '#1a1a1a' },
  overlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 100 },
  instructionTextOverlay: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: '700', marginBottom: 20 },
  outlineCenter: { width: 400, height: 180, alignItems: 'center', justifyContent: 'center' },
  mainOutlineBig: { width: '100%', height: '100%', opacity: 0.8 },
  fullGreenBorder: { position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, borderWidth: 4, borderColor: '#22c55e', borderRadius: 12, zIndex: 10 },
  edgeGuideBoxMock: { position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, zIndex: 1 },

  categoryBarMock: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    zIndex: 10
  },
  categoryTabMock: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  categoryTabActiveMock: { backgroundColor: '#1e6bd6' },
  categoryTabTextMock: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' },
  categoryTabTextActiveMock: { color: '#fff' },

  angleInfoBoxMock: {
    position: 'absolute',
    bottom: 40,
    right: 120,
    alignItems: 'center',
    zIndex: 15
  },
  angleInfoLabel: { color: '#fff', fontSize: 10, fontWeight: '600', marginBottom: 5 },
  angleInfoPreview: {
    width: 60,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  angleInfoOutline: { width: '80%', height: '80%', tintColor: 'rgba(255,255,255,0.6)' },
  angleInfoMandatory: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700' },

  subInstructionText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 20, fontWeight: '500' },

  angleBoxFloating: { position: 'absolute', bottom: 40, right: 100, backgroundColor: 'rgba(30,107,214,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  angleFloatingText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  mockRightControlsSimple: { position: 'absolute', right: 40, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  mockCameraBtnOuter: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(30,107,214,0.3)', padding: 4 },
  mockCameraBtnInner: { flex: 1, backgroundColor: '#fff', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },

  categoriesCombinedRow: { flexDirection: 'row', gap: 20, marginTop: 20 },
  catBox: { width: 100, height: 80, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  catText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  nextBtnOverlayPortrait: { position: 'absolute', bottom: 60, alignSelf: 'center' },
  nextBtnOverlayLandscape: { position: 'absolute', bottom: 30, right: 60 },
  nextBtnText: { color: '#1e6bd6', fontSize: 18, fontWeight: '900' },

  footer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
=======
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
});
