import React, { useState } from 'react';
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

const DNP_AGREEMENT_TEXT = `
DNP (Distributor Network Partner) Terms and Conditions

1. Program Overview
The Auto Bidder DNP Program allows verified users to earn commissions by bringing new vehicle listings to the platform and promoting existing listings to prospective buyers.

2. Membership Fee
Annual DNP Membership Fee: ₹5,000
Special Launch Offer: Pay After You Earn
The membership fee will be deducted from your earnings after you start generating commissions according to company policy.

3. Commission Structure
- Listing Approval Reward: Flat commission when a referred listing gets approved
- Vehicle Sale Commission: Percentage commission when a referred vehicle is sold
- Bonus Commissions: Additional rewards for high-performing partners

4. Responsibilities
- Only refer genuine sellers and buyers
- Maintain professional conduct
- Follow platform guidelines
- Report suspicious activity

5. Payment Terms
- Commissions are credited after successful transaction completion
- Minimum withdrawal threshold: ₹1,000
- Withdrawal requests subject to fraud check and admin approval

6. Termination
Auto Bidder reserves the right to terminate DNP membership for:
- Fraudulent activities
- Policy violations
- Misconduct

By accepting this agreement, you agree to abide by all terms and conditions.
`;

export default function DNPActivationScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [deferredFeeAccepted, setDeferredFeeAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const handleActivate = async () => {
    if (!agreementAccepted || !deferredFeeAccepted) {
      Alert.alert('Required', 'Please accept both the agreement and deferred fee terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      // API call to activate DNP profile
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          agreementAccepted: true,
          termsVersion: '1.0',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Congratulations!',
          'Welcome to Auto Bidder DNP Program. You can now start earning!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to activate DNP profile. Please try again.');
      }
    } catch (error) {
      console.error('DNP Activation Error:', error);
      Alert.alert('Error', 'Failed to activate DNP profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>DNP Activation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <MaterialCommunityIcons name="crown" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.welcomeTitle}>Become an Auto Bidder DNP Partner</Text>
          <Text style={styles.welcomeSubtitle}>
            Congratulations! Auto Bidder is inviting selected users to become Distributor Network Partners (DNP).
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You can earn by:</Text>
          <View style={styles.benefitsList}>
            <BenefitItem 
              icon="car-outline"
              title="Bringing vehicle listings to our platform"
              description="Refer sellers and earn when their listings get approved"
            />
            <BenefitItem 
              icon="share-social-outline"
              title="Sharing existing listings with interested buyers"
              description="Promote cars and earn when buyers complete purchases"
            />
            <BenefitItem 
              icon="checkmark-circle-outline"
              title="Helping close successful deals"
              description="Get rewarded for facilitating successful transactions"
            />
          </View>
        </View>

        {/* Special Offer Card */}
        <View style={styles.offerCard}>
          <View style={styles.offerHeader}>
            <MaterialCommunityIcons name="gift" size={28} color={COLORS.coral} />
            <Text style={styles.offerTag}>Special Launch Offer</Text>
          </View>
          
          <View style={styles.offerContent}>
            <Text style={styles.offerTitle}>Annual DNP Membership Fee</Text>
            <Text style={styles.offerPrice}>₹5,000</Text>
            
            <View style={styles.offerDivider} />
            
            <Text style={styles.offerBut}>But...</Text>
            <Text style={styles.offerHighlight}>Pay After You Earn</Text>
            <Text style={styles.offerDesc}>
              No upfront payment is required. The membership fee will be adjusted only after you start earning through the platform according to company policy.
            </Text>
          </View>
        </View>

        {/* Agreement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          
          <Pressable 
            style={styles.agreementPreview}
            onPress={() => setShowAgreement(true)}
          >
            <View style={styles.agreementHeader}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.agreementTitle}>View Full Agreement</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
            </View>
            <Text style={styles.agreementPreviewText} numberOfLines={2}>
              DNP (Distributor Network Partner) Terms and Conditions - Program Overview, Membership Fee, Commission Structure...
            </Text>
          </Pressable>

          <View style={styles.checkboxContainer}>
            <Pressable 
              style={styles.checkbox}
              onPress={() => setAgreementAccepted(!agreementAccepted)}
            >
              <View style={[styles.checkboxBox, agreementAccepted && styles.checkboxChecked]}>
                {agreementAccepted && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxText}>
                I have read and agree to the DNP Terms & Conditions
              </Text>
            </Pressable>

            <Pressable 
              style={styles.checkbox}
              onPress={() => setDeferredFeeAccepted(!deferredFeeAccepted)}
            >
              <View style={[styles.checkboxBox, deferredFeeAccepted && styles.checkboxChecked]}>
                {deferredFeeAccepted && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxText}>
                I understand that the ₹5,000 annual DNP membership fee will be deducted after my earnings as per company policy
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Activate Button */}
        <Pressable 
          style={[
            styles.activateBtn,
            (!agreementAccepted || !deferredFeeAccepted) && styles.activateBtnDisabled,
          ]}
          onPress={handleActivate}
          disabled={!agreementAccepted || !deferredFeeAccepted || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.activateBtnText}>Activate DNP</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Agreement Modal */}
      {showAgreement && (
        <View style={styles.agreementModal}>
          <View style={styles.agreementModalContent}>
            <View style={styles.agreementModalHeader}>
              <Text style={styles.agreementModalTitle}>DNP Agreement</Text>
              <Pressable onPress={() => setShowAgreement(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>
            <ScrollView style={styles.agreementModalScroll}>
              <Text style={styles.agreementModalText}>{DNP_AGREEMENT_TEXT}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function BenefitItem({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        <Ionicons name={icon} size={24} color={COLORS.secondary} />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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
  headerTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: COLORS.lightBlue1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeIcon: {
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
  welcomeTitle: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  benefitDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  offerCard: {
    backgroundColor: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.coral,
    marginBottom: 24,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
  },
  offerTag: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.coral,
    fontSize: 14,
  },
  offerContent: {
    padding: 20,
  },
  offerTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  offerPrice: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 16,
  },
  offerDivider: {
    height: 1,
    backgroundColor: COLORS.lightGrey1,
    marginVertical: 16,
  },
  offerBut: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.coral,
    marginBottom: 8,
  },
  offerHighlight: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  offerDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  agreementPreview: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    marginBottom: 16,
  },
  agreementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  agreementTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
    flex: 1,
  },
  agreementPreviewText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.lightGrey1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkboxText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.black2,
    flex: 1,
    lineHeight: 20,
  },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  activateBtnDisabled: {
    backgroundColor: COLORS.lightGrey1,
    shadowOpacity: 0,
    elevation: 0,
  },
  activateBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  agreementModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  agreementModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  agreementModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  agreementModalTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  agreementModalScroll: {
    padding: 20,
  },
  agreementModalText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.black2,
    lineHeight: 24,
  },
});
