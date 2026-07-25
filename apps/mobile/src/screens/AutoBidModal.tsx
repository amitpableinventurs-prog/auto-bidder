import { FONTS } from '../theme';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  bg: "#0a0d14",
  surface: "#111827",
  surface2: "#1a2235",
  border: "#1e2d45",
  accent: "#fbbf24",
  blue: "#3b82f6",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  green: "#22c55e",
};

export default function AutoBidModal({
  currentBid,
  onClose,
  onEnable
}: {
  currentBid: number,
  onClose: () => void,
  onEnable: (maxBid: number) => void
}) {
  const [maxBid, setMaxBid] = useState((currentBid + 10000).toString());

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Enable Auto Bid</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="robot" size={32} color={COLORS.accent} />
          <Text style={styles.infoText}>
            Our system will automatically increase your bid by the minimum increment whenever you are outbid, up to your maximum limit.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>SET YOUR MAXIMUM LIMIT</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currency}><Text style={{ fontFamily: undefined }}>₹</Text></Text>
            <TextInput
              style={styles.input}
              value={maxBid}
              onChangeText={setMaxBid}
              keyboardType="numeric"
              autoFocus
              placeholder="0"
              placeholderTextColor={COLORS.textDim}
            />
          </View>
          <Text style={styles.hint}>Current Bid: <Text style={{ fontFamily: undefined }}>₹</Text> {currentBid.toLocaleString('en-IN')}</Text>
        </View>

        <Pressable
          style={styles.enableBtn}
          onPress={() => onEnable(parseInt(maxBid.replace(/,/g, '')))}
        >
          <Text style={styles.enableText}>ACTIVATE AUTO BID</Text>
          <Ionicons name="flash" size={18} color="#000" />
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, paddingBottom: 50, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '900', fontFamily: FONTS.poppins.black },
  infoBox: { flexDirection: 'row', gap: 16, backgroundColor: COLORS.surface2, padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 30 },
  infoText: { flex: 1, color: COLORS.textMuted, fontSize: 14, lineHeight: 18, fontFamily: FONTS.poppins.regular },
  inputSection: { marginBottom: 40 },
  label: { color: COLORS.textDim, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, fontFamily: FONTS.poppins.extraBold },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.accent, paddingVertical: 10 },
  currency: { color: COLORS.text, fontSize: 30, fontWeight: '900', marginRight: 12, fontFamily: FONTS.poppins.black },
  input: { flex: 1, color: COLORS.text, fontSize: 30, fontWeight: '900', fontFamily: FONTS.poppins.black },
  hint: { color: COLORS.textDim, fontSize: 12, marginTop: 10, fontFamily: FONTS.poppins.medium },
  enableBtn: { height: 50, backgroundColor: COLORS.accent, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  enableText: { color: '#000', fontSize: 16, fontWeight: '900', fontFamily: FONTS.poppins.black },
});
