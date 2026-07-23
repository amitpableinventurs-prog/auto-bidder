import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const COLORS = {
  primary: '#2873c3',
  text: '#0b1020',
  muted: '#6b7280',
  success: '#22c55e',
  bg: '#f8fafc',
  white: '#ffffff',
};

const INSPECTION_POINTS = {
  Exterior: [
    { id: 'ext1', label: 'Front' },
    { id: 'ext2', label: 'Front Right 45°' },
    { id: 'ext3', label: 'Right Side' },
    { id: 'ext4', label: 'Rear Right 45°' },
    { id: 'ext5', label: 'Rear' },
    { id: 'ext6', label: 'Rear Left 45°' },
    { id: 'ext7', label: 'Left Side' },
    { id: 'ext8', label: 'Front Left 45°' },
    { id: 'ext9', label: 'Roof' },
    { id: 'ext10', label: 'Windshield' },
  ],
  Interior: [
    { id: 'int1', label: 'Dashboard' },
    { id: 'int2', label: 'Odometer' },
    { id: 'int3', label: 'Steering Wheel' },
    { id: 'int4', label: 'Front Seats' },
    { id: 'int5', label: 'Rear Seats' },
    { id: 'int6', label: 'Roof Lining' },
    { id: 'int7', label: 'Door Pads' },
  ],
  Mechanical: [
    { id: 'mech1', label: 'Engine Bay' },
    { id: 'mech2', label: 'Battery' },
    { id: 'mech3', label: 'Tyre Tread (FR)' },
    { id: 'mech4', label: 'Tyre Tread (FL)' },
    { id: 'mech5', label: 'Tyre Tread (RR)' },
    { id: 'mech6', label: 'Tyre Tread (RL)' },
    { id: 'mech7', label: 'Spare Wheel' },
    { id: 'mech8', label: 'Underbody' },
  ]
};

export default function InspectionReport() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FillDetails'>>(); // Reusing param type for simplicity if not defined
  const { listingData } = (route.params as any) || {};

  const handleFinish = () => {
      navigation.navigate('AuctionSetup', { listingData });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Inspection Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Photo Inspection Checklist</Text>
            <Text style={styles.infoDesc}>Verified 25 critical points for {listingData?.carType || 'Vehicle'}</Text>
        </View>

        {Object.entries(INSPECTION_POINTS).map(([category, points]) => (
            <View key={category} style={styles.section}>
                <Text style={styles.sectionTitle}>{category}</Text>
                <View style={styles.grid}>
                    {points.map((point) => (
                        <View key={point.id} style={styles.pointItem}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                            </View>
                            <Text style={styles.pointLabel}>{point.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        ))}

        <Pressable style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>FINISH & SET PRICE</Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  content: { padding: 15 },
  infoCard: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 20, marginBottom: 20 },
  infoTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  infoDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pointItem: { width: '48%', backgroundColor: COLORS.white, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  pointLabel: { fontSize: 13, color: COLORS.text, fontWeight: '500', flex: 1 },

  finishBtn: { backgroundColor: COLORS.primary, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  finishBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
