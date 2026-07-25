import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Clipboard,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function DNPReferralScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [referralData, setReferralData] = useState({
    code: 'AB-DNP-1234',
    link: 'https://autobidder.in?ref=AB-DNP-1234',
  });

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(referralData.link);
      Alert.alert('Copied!', 'Referral link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleShare = async (platform: string) => {
    const message = `Join Auto Bidder using my referral code: ${referralData.code}\n\nDownload the app: ${referralData.link}`;
    
    try {
      if (platform === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        // In a real app, you would use Linking.openURL(url)
        Alert.alert('WhatsApp', 'Opening WhatsApp...');
      } else if (platform === 'facebook') {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.link)}`;
        Alert.alert('Facebook', 'Opening Facebook...');
      } else if (platform === 'telegram') {
        const url = `tg://msg?text=${encodeURIComponent(message)}`;
        Alert.alert('Telegram', 'Opening Telegram...');
      } else if (platform === 'sms') {
        const url = `sms:?body=${encodeURIComponent(message)}`;
        Alert.alert('SMS', 'Opening SMS...');
      } else if (platform === 'general') {
        await Share.share({
          message: message,
          url: referralData.link,
        });
      }
    } catch (error) {
      console.error('Share Error:', error);
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleGenerateQR = () => {
    Alert.alert('QR Code', 'QR Code generation feature - would show QR code for referral link');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Share & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Referral Code Card */}
        <View style={styles.referralCard}>
          <View style={styles.referralIcon}>
            <MaterialCommunityIcons name="qrcode" size={48} color={COLORS.secondary} />
          </View>
          <Text style={styles.referralTitle}>Your Referral Code</Text>
          <Text style={styles.referralSubtitle}>Share this code and earn commissions</Text>
          
          <View style={styles.codeBox}>
            <Text style={styles.code}>{referralData.code}</Text>
            <Pressable style={styles.copyBtn} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={20} color={COLORS.white} />
            </Pressable>
          </View>
        </View>

        {/* Referral Link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Link</Text>
          <View style={styles.linkCard}>
            <Text style={styles.link} numberOfLines={2}>{referralData.link}</Text>
            <Pressable style={styles.copyLinkBtn} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={18} color={COLORS.secondary} />
              <Text style={styles.copyLinkText}>Copy</Text>
            </Pressable>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Via</Text>
          <View style={styles.shareGrid}>
            <ShareOption
              icon="logo-whatsapp"
              label="WhatsApp"
              color="#25D366"
              onPress={() => handleShare('whatsapp')}
            />
            <ShareOption
              icon="logo-facebook"
              label="Facebook"
              color="#1877F2"
              onPress={() => handleShare('facebook')}
            />
            <ShareOption
              icon="send"
              label="Telegram"
              color="#0088cc"
              onPress={() => handleShare('telegram')}
            />
            <ShareOption
              icon="chatbubble-outline"
              label="SMS"
              color="#0084FF"
              onPress={() => handleShare('sms')}
            />
            <ShareOption
              icon="share-social-outline"
              label="More"
              color={COLORS.secondary}
              onPress={() => handleShare('general')}
            />
            <ShareOption
              icon="qr-code-outline"
              label="QR Code"
              color={COLORS.black2}
              onPress={handleGenerateQR}
            />
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.stepsList}>
            <StepItem
              step={1}
              title="Share your referral code"
              description="Share your unique code with friends, family, or on social media"
            />
            <StepItem
              step={2}
              title="They join Auto Bidder"
              description="When they sign up using your code, they get attributed to you"
            />
            <StepItem
              step={3}
              title="Earn commissions"
              description="Get paid when they list vehicles or when those vehicles are sold"
            />
          </View>
        </View>

        {/* Commission Info */}
        <View style={styles.commissionCard}>
          <View style={styles.commissionHeader}>
            <MaterialCommunityIcons name="cash" size={28} color={COLORS.success} />
            <Text style={styles.commissionTitle}>Commission Structure</Text>
          </View>
          <View style={styles.commissionList}>
            <CommissionItem
              title="Listing Approval"
              value="₹300 flat"
              description="When referred listing gets approved"
            />
            <CommissionItem
              title="Vehicle Sale"
              value="2-5%"
              description="Commission on successful vehicle sale"
            />
            <CommissionItem
              title="Bonus Rewards"
              value="Variable"
              description="Special bonuses for top performers"
            />
          </View>
        </View>

        {/* Attribution Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>30-Day Attribution Window</Text>
            <Text style={styles.infoDesc}>
              Referrals are tracked for 30 days. If a user joins or lists a vehicle within this period using your code, you'll earn commissions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ShareOption({ icon, label, color, onPress }: { 
  icon: any, 
  label: string, 
  color: string, 
  onPress: () => void 
}) {
  return (
    <Pressable style={styles.shareOption} onPress={onPress}>
      <View style={[styles.shareOptionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.shareOptionLabel}>{label}</Text>
    </Pressable>
  );
}

function StepItem({ step, title, description }: { 
  step: number, 
  title: string, 
  description: string 
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{description}</Text>
      </View>
    </View>
  );
}

function CommissionItem({ title, value, description }: { 
  title: string, 
  value: string, 
  description: string 
}) {
  return (
    <View style={styles.commissionItem}>
      <View style={styles.commissionItemLeft}>
        <Text style={styles.commissionItemTitle}>{title}</Text>
        <Text style={styles.commissionItemDesc}>{description}</Text>
      </View>
      <Text style={styles.commissionItemValue}>{value}</Text>
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
  referralCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  referralIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    ...TYPOGRAPHY.h5,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  referralSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
  },
  code: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    letterSpacing: 3,
  },
  copyBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  link: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 12,
  },
  copyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  copyLinkText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
    fontSize: 12,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    margin: 8,
  },
  shareOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    textAlign: 'center',
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  stepDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  commissionCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 24,
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  commissionTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: '#166534',
  },
  commissionList: {
    gap: 12,
  },
  commissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
  },
  commissionItemLeft: {
    flex: 1,
  },
  commissionItemTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  commissionItemDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  commissionItemValue: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.success,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: '#9a3412',
    marginBottom: 4,
  },
  infoDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: '#c2410c',
    lineHeight: 18,
  },
});
