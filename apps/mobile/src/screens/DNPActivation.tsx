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
import { COLORS, TYPOGRAPHY, FONTS, getShadow } from '../theme';
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
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainDrawer')}
        >
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
          <View style={styles.badgeContainer}>
            <View style={styles.crownCircle}>
              <MaterialCommunityIcons name="crown" size={32} color={COLORS.secondary} />
            </View>
            <View style={styles.sparkleContainer}>
              <Ionicons name="sparkles" size={16} color={COLORS.secondary} style={styles.sparkle1} />
              <Ionicons name="sparkles" size={12} color={COLORS.secondary} style={styles.sparkle2} />
            </View>
          </View>

          <Text style={styles.congratsTitle}>Distributor Network Partner</Text>
          <Text style={styles.congratsSubtitle}>Exclusive Early Access for You!</Text>

          <View style={styles.benefitRow}>
            <View style={styles.benefitItem}>
              <Ionicons name="flash-outline" size={16} color={COLORS.green} />
              <Text style={styles.benefitText}>Zero Upfront Cost</Text>
            </View>
            <View style={styles.benefitDot} />
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up-outline" size={16} color={COLORS.green} />
              <Text style={styles.benefitText}>Unlimited Earnings</Text>
            </View>
          </View>
        </View>

        <View style={styles.feeCard}>
          <Text style={styles.sectionTitle}>Activation Details</Text>

          <View style={styles.feeHighlight}>
            <View>
              <Text style={styles.feeLabel}>Payable Today</Text>
              <Text style={styles.feeValueMain}>₹0.00</Text>
            </View>
            <View style={styles.feeBadge}>
              <Text style={styles.feeBadgeText}>APPROVED</Text>
            </View>
          </View>

          <View style={styles.feeInfoBox}>
            <Text style={styles.feeInfoText}>
              The <Text style={styles.boldText}>₹5,000</Text> annual membership fee is deferred. It will be recovered automatically from your <Text style={styles.boldText}>future earnings</Text> only.
            </Text>
          </View>

          <View style={styles.summaryList}>
            <SummaryRow label="Annual Membership Fee" value="₹5,000" />
            <SummaryRow label="Special Offer Discount" value="- ₹5,000" valueStyle={{ color: COLORS.green }} />
            <View style={styles.divider} />
            <SummaryRow label="Amount to Pay Now" value="₹0" valueStyle={styles.boldText} />
          </View>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  congratsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    ...getShadow(0, 10, 0.05, 20, "#000", 4),
  },
  badgeContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle1: { position: 'absolute', top: 0, right: -4 },
  sparkle2: { position: 'absolute', bottom: 10, left: -8 },
  congratsTitle: { fontSize: 20, fontFamily: FONTS.poppins.bold, color: COLORS.black2, textAlign: 'center' },
  congratsSubtitle: { fontSize: 13, color: COLORS.secondary, fontFamily: FONTS.poppins.bold, textAlign: 'center', marginTop: 4 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 11,
    fontFamily: FONTS.poppins.bold,
    color: '#059669',
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  feeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...getShadow(0, 4, 0.03, 12, "#000", 2),
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 20,
  },
  feeHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  feeLabel: {
    fontSize: 11,
    color: '#166534',
    fontFamily: FONTS.poppins.bold,
    textTransform: 'uppercase',
  },
  feeValueMain: {
    fontSize: 28,
    fontFamily: FONTS.poppins.bold,
    color: '#15803d',
  },
  feeBadge: {
    backgroundColor: '#15803d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feeBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  feeInfoBox: {
    marginBottom: 24,
  },
  feeInfoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  summaryList: {
    gap: 12,
  },
  boldText: { fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  summaryValue: { fontSize: 13, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  agreementSection: { marginBottom: 30 },
  agreementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  agreementBtnText: { fontSize: 13, fontFamily: FONTS.poppins.bold, color: COLORS.black2, flex: 1 },
  checkboxes: { gap: 16, marginTop: 12 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  checkboxLabel: { fontSize: 12, color: COLORS.black2, flex: 1, lineHeight: 18, fontFamily: FONTS.poppins.medium },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    ...getShadow(0, 10, 0.3, 20, COLORS.secondary, 8),
  },
  disabledBtn: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
  activateBtnText: { fontSize: 16, fontFamily: FONTS.poppins.bold, color: COLORS.white },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 1000 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey2 },
  modalTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold },
  modalScroll: { padding: 20 },
  agreementText: { ...TYPOGRAPHY.bodySmall, color: COLORS.black2, lineHeight: 24 },
});
