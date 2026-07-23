import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function StarPointsModal({
  visible,
  onClose,
  listing
}: {
  visible: boolean;
  onClose: () => void;
  listing?: any;
}) {
  const derivedPoints = (listing?.starPoints && listing.starPoints.length > 0) ? listing.starPoints : [
    `Verified ${listing?.ownership || '1st'} Owner car with complete documentation and original RC.`,
    `${listing?.kilometersDriven?.toLocaleString() || 'Low'} Kms driven with ${listing?.fuelType || 'Petrol/CNG'} engine efficiency and ${listing?.transmission || 'Manual'} gearbox.`,
    `${listing?.condition || 'Excellent'} mechanical condition verified by AutoBidder's 140-point expert inspection.`,
    `Insurance Type: ${listing?.insuranceType || 'Comprehensive'} with no major accidental history detected.`,
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.imageWrapper}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>

            <Image
              source={{ uri: listing?.imageUrl || 'https://images.unsplash.com/photo-1542362567-b055002b91f4?auto=format&fit=crop&w=800&q=80' }}
              style={styles.image}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
               <Text style={styles.title}>Star Points</Text>
               <Ionicons name="star" size={22} color="#FF7D6B" />
            </View>

            <Text style={styles.carName}>{listing?.title || 'Mahindra Thar(2019) - AX (0) D 2WD HT'}</Text>

            <View style={styles.pointsCard}>
                {derivedPoints.map((point: string, i: number) => (
                   <View key={i} style={styles.pointRow}>
                      <Ionicons name="checkmark" size={20} color="#1E6BD6" />
                      <Text style={styles.pointText}>
                         {point}
                      </Text>
                   </View>
                ))}
            </View>

            <Pressable style={styles.knowMoreBtn} onPress={onClose}>
               <Text style={styles.knowMoreText}>KNOW MORE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  imageWrapper: {
    height: 200,
    width: '100%',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.poppins.bold,
    color: '#1E6BD6',
  },
  carName: {
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    marginBottom: 20,
    color: '#000',
    lineHeight: 24,
  },
  pointsCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 8,
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  pointRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: FONTS.openSans.regular,
  },
  knowMoreBtn: {
    backgroundColor: '#266EB9',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knowMoreText: {
    color: '#FFF',
    fontFamily: FONTS.poppins.bold,
    fontSize: 14,
  }
});
