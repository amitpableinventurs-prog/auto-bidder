import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPActivationScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [deferredFeeAccepted, setDeferredFeeAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAgreement, setFetchingAgreement] = useState(true);
  const [agreementData, setAgreementData] = useState<any>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  useEffect(() => {
    const getAgreement = async () => {
      try {
        const data = await request<any>('/api/dnp/agreement');
        setAgreementData(data);
      } catch (error) {
        console.error('Agreement Fetch Error:', error);
      } finally {
        setFetchingAgreement(false);
      }
    };
    getAgreement();
  }, []);

  const handleActivate = async () => {
    if (!agreementAccepted || !deferredFeeAccepted) {
      Alert.alert('Required', 'Please accept both the DNP Agreement and the Fee Recovery terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      const data = await request<any>('/api/dnp/activate', {
        method: 'POST',
        body: JSON.stringify({
          agreementAccepted: true,
          agreementVersion: agreementData?.version || '1.0',
          termsVersion: agreementData?.termsVersion || '1.0',
        }),
      });

      Alert.alert(
        'Congratulations!',
        'Your DNP profile is now active. Welcome to the Auto Bidder Distributor Network Partner program!',
        [{ text: 'Start Earning', onPress: () => navigation.replace('DNPDashboard') }]
      );
    } catch (error: any) {
      Alert.alert('Activation Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAgreement) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Activate My DNP</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.congratsCard}>
          <View style={styles.crownIcon}>
            <MaterialCommunityIcons name="crown" size={40} color={COLORS.secondary} />
          </View>
          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsSubtitle}>You have been selected for Zero Upfront Cost.</Text>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              Your annual DNP membership fee is <Text style={styles.boldText}>₹5,000</Text>. You do not need to pay anything today.
              Your membership fee will be recovered from your future DNP earnings according to the DNP Agreement
              and applicable Terms & Conditions.
            </Text>
          </View>
        </View>

        <View style={styles.feeSummary}>
          <Text style={styles.summaryTitle}>Membership Fee Summary</Text>

          <SummaryRow label="Annual DNP Membership Fee" value="₹5,000" />
          <SummaryRow label="Pay Today" value="₹0" valueStyle={{ color: COLORS.green }} />
          <View style={styles.divider} />
          <SummaryRow label="Payment Plan" value="Pay After You Earn" valueStyle={styles.boldGreen} />
          <SummaryRow label="Recovery Source" value="Future DNP Earnings" />
        </View>

        <View style={styles.agreementSection}>
          <Pressable style={styles.agreementBtn} onPress={() => setShowAgreementModal(true)}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.agreementBtnText}>View DNP Agreement</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
          </Pressable>

          <Pressable style={styles.agreementBtn} onPress={() => Alert.alert('Terms', 'Full T&C would open here')}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.agreementBtnText}>View Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
          </Pressable>

          <View style={styles.checkboxes}>
            <Checkbox
              checked={agreementAccepted}
              onPress={() => setAgreementAccepted(!agreementAccepted)}
              label="I have read and accepted the DNP Agreement and Terms & Conditions."
            />
            <Checkbox
              checked={deferredFeeAccepted}
              onPress={() => setDeferredFeeAccepted(!deferredFeeAccepted)}
              label="I understand that the annual membership fee of ₹5,000 is not payable upfront and may be recovered from my future DNP earnings according to the agreed recovery terms."
            />
          </View>
        </View>

        <Pressable
          style={[styles.activateBtn, (!agreementAccepted || !deferredFeeAccepted) && styles.disabledBtn]}
          onPress={handleActivate}
          disabled={!agreementAccepted || !deferredFeeAccepted || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.activateBtnText}>Activate My DNP</Text>
              <Ionicons name="sparkles" size={18} color={COLORS.white} />
            </>
          )}
        </Pressable>
      </ScrollView>

      {showAgreementModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>DNP Agreement</Text>
              <Pressable onPress={() => setShowAgreementModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.agreementText}>
                {agreementData?.content || 'Loading agreement...'}
              </Text>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, valueStyle }: { label: string, value: string, valueStyle?: any }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
    </View>
  );
}

function Checkbox({ checked, onPress, label }: { checked: boolean, onPress: () => void, label: string }) {
  return (
    <Pressable style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  congratsCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  crownIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  congratsTitle: { ...TYPOGRAPHY.h5, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 8 },
  congratsSubtitle: { ...TYPOGRAPHY.bodyMedium, color: COLORS.secondary, fontFamily: FONTS.poppins.bold, textAlign: 'center' },
  explanationBox: { marginTop: 16, padding: 12, backgroundColor: COLORS.white, borderRadius: 12 },
  explanationText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  boldText: { fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  feeSummary: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    marginBottom: 24,
  },
  summaryTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted },
  summaryValue: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  boldGreen: { color: COLORS.green, fontFamily: FONTS.poppins.bold },
  divider: { height: 1, backgroundColor: COLORS.lightGrey2, marginVertical: 12 },
  agreementSection: { marginBottom: 24 },
  agreementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    marginBottom: 12,
    gap: 12,
  },
  agreementBtnText: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, flex: 1 },
  checkboxes: { gap: 16, marginTop: 12 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.lightGrey1,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  checkboxLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.black2, flex: 1, lineHeight: 20 },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 18,
    gap: 10,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledBtn: { backgroundColor: COLORS.lightGrey1, shadowOpacity: 0, elevation: 0 },
  activateBtnText: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.white, fontSize: 16 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 1000 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey2 },
  modalTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold },
  modalScroll: { padding: 20 },
  agreementText: { ...TYPOGRAPHY.bodySmall, color: COLORS.black2, lineHeight: 24 },
});
