import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';

interface NeedAssistanceProps {
  showTitle?: boolean;
  horizontalPadding?: number;
  onScheduleMeeting?: () => void;
  onFAQ?: () => void;
}

const WHATSAPP_NUMBER = '919876543210'; // Replace with actual number
const CALL_BACK_NUMBER = '919876543210'; // Replace with actual number

export default function NeedAssistance({
  showTitle = true,
  horizontalPadding = 15,
  onScheduleMeeting,
  onFAQ
}: NeedAssistanceProps) {
  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=Hello, I need assistance with Auto Bidder.`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const openPhone = () => {
    Linking.openURL(`tel:${CALL_BACK_NUMBER}`);
  };

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {showTitle && <Text style={styles.sectionTitle}>Need Assistance?</Text>}

      {onScheduleMeeting && (
        <Pressable style={styles.assistanceCard} onPress={onScheduleMeeting}>
          <View style={styles.assistanceIconBox}>
            <Ionicons name="calendar-outline" size={22} color="#FFF" />
          </View>
          <View style={styles.assistanceTextInfo}>
            <Text style={styles.assistanceLabel}>Schedule Meeting With Seller</Text>
            <Text style={styles.assistanceSub}>Book an inspection slot.</Text>
          </View>
        </Pressable>
      )}

      <Pressable style={styles.assistanceCard} onPress={openWhatsApp}>
        <View style={styles.assistanceIconBox}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="#fff" />
        </View>
        <View style={styles.assistanceTextInfo}>
          <Text style={styles.assistanceLabel}>Chat With Us On WhatsApp</Text>
          <Text style={styles.assistanceSub}>Instant support via chat.</Text>
        </View>
      </Pressable>

      <Pressable style={styles.assistanceCard} onPress={openPhone}>
        <View style={styles.assistanceIconBox}>
          <Ionicons name="call-outline" size={24} color="#fff" />
        </View>
        <View style={styles.assistanceTextInfo}>
          <Text style={styles.assistanceLabel}>Request A Call Back</Text>
          <Text style={styles.assistanceSub}>We'll call you soon.</Text>
        </View>
      </Pressable>

      {onFAQ && (
        <Pressable style={styles.assistanceCard} onPress={onFAQ}>
          <View style={styles.assistanceIconBox}>
            <Ionicons name="help-circle-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.assistanceTextInfo}>
            <Text style={styles.assistanceLabel}>Frequently Asked Questions</Text>
            <Text style={styles.assistanceSub}>Answers to common questions.</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 16,
    color: COLORS.black2,
    textAlign: 'center',
    marginBottom: 12,
  },
  assistanceCard: {
    backgroundColor: '#1E2030',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    gap: 12,
  },
  assistanceIconBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistanceTextInfo: {
    flex: 1,
  },
  assistanceLabel: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
  },
  assistanceSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    marginTop: 1,
    fontFamily: FONTS.openSans.regular,
  },
});
