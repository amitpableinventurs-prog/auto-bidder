import React from 'react';
import {
  Dimensions,
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

export default function CameraGuidance() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CameraGuidance'>>();
  const { listingData } = (route.params as any) || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        {/* Green frame preview */}
        <View style={styles.framePreview}>
          <MaterialCommunityIcons name="car-outline" size={SCREEN_W * 0.52} color="rgba(255,255,255,0.7)" />
          <View style={styles.greenBorder} />
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
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'space-between' },

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
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
