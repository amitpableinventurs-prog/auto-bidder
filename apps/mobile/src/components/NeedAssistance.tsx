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
            <Ionicons name="calendar-outline" size={24} color="#FFF" />
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
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 18,
    color: COLORS.black2,
    textAlign: 'left',
    marginBottom: 12,
  },
  assistanceCard: {
    backgroundColor: '#1E202B',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 15,
  },
  assistanceIconBox: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistanceTextInfo: {
    flex: 1,
  },
  assistanceLabel: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: FONTS.poppins.bold,
  },
  assistanceSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
    fontFamily: FONTS.openSans.regular,
  },
});
