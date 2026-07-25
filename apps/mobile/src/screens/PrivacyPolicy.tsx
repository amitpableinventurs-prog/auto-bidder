import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DARK = '#0f172a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const GREEN = '#059669';
const BG = '#f8fafc';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect the following categories of information when you use the Auto Bidder app:\n\nPersonal Information:\n• Full name, phone number, and email address\n• Government-issued ID details (Aadhaar, PAN, Driving Licence)\n• Address and location data\n• Profile photo and selfie for KYC verification\n\nVehicle & Transaction Data:\n• Vehicle registration numbers and RC details\n• Auction bids, purchase history, and listing data\n• Bank account details for payments and payouts\n• Uploaded documents (RC, insurance, NOC, invoice)\n\nDevice & Usage Data:\n• Device model, OS version, and unique device identifiers\n• App usage patterns, screens visited, and time spent\n• IP address and approximate location\n• Push notification tokens`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to:\n\n• Create and manage your account\n• Facilitate vehicle auctions, buying, and selling\n• Process payments and payouts\n• Verify your identity (KYC) as required by law\n• Send transaction confirmations, OTPs, and service updates\n• Improve the App's features and user experience\n• Prevent fraud, money laundering, and abuse\n• Comply with legal and regulatory obligations\n• Send marketing communications (only with your consent)\n\nWe do not use your personal data for automated decision-making that significantly affects your legal rights.`,
  },
  {
    title: '3. Information Sharing',
    body: `We do not sell your personal information. We may share your data with:\n\nService Providers:\n• Payment gateways (Razorpay, Stripe) for transaction processing\n• SMS/OTP providers for authentication\n• Cloud storage providers for secure data hosting\n• Inspection partners for vehicle assessment\n\nLegal & Regulatory Bodies:\n• Government authorities when required by law\n• Courts or law enforcement with valid legal process\n• RTO offices for vehicle transfer facilitation\n\nBusiness Transfers:\n• In the event of a merger, acquisition, or sale of assets, user data may be transferred with appropriate safeguards.\n\nAll third-party partners are contractually bound to protect your data and use it only for specified purposes.`,
  },
  {
    title: '4. Data Security',
    body: `We implement industry-standard security measures to protect your data:\n\n• End-to-end encryption for sensitive communications\n• AES-256 encryption for stored personal and financial data\n• Regular security audits and penetration testing\n• Multi-factor authentication for account access\n• Strict access controls — only authorized personnel can access user data\n• Automatic session timeout after inactivity\n\nWhile we take every reasonable precaution, no digital system is 100% secure. We encourage you to use a strong, unique password and never share your OTP with anyone.`,
  },
  {
    title: '5. Data Retention',
    body: `We retain your personal data for as long as:\n\n• Your account is active\n• Required to fulfill the purposes described in this policy\n• Mandated by applicable law (e.g., financial records for 7 years as per Indian tax law)\n\nAfter account deletion, we anonymize or securely delete your data within 30 days, except where retention is required by law.\n\nTransaction records may be retained for up to 7 years for audit and compliance purposes.`,
  },
  {
    title: '6. Your Rights',
    body: `As a user, you have the following rights regarding your personal data:\n\n• Access: Request a copy of the personal data we hold about you\n• Correction: Request correction of inaccurate or incomplete data\n• Deletion: Request deletion of your account and associated data\n• Portability: Request your data in a structured, machine-readable format\n• Withdrawal of Consent: Withdraw consent for marketing communications at any time\n• Grievance Redressal: Raise a complaint with our Data Protection Officer\n\nTo exercise these rights, email us at privacy@autobidder.in. We will respond within 30 days.`,
  },
  {
    title: '7. Location Data',
    body: `The Auto Bidder app may request access to your device's location to:\n\n• Show vehicles available near you\n• Pre-fill your city during registration\n• Facilitate seller-buyer meeting location suggestions\n\nLocation access is optional. You can disable it in your device settings at any time. Disabling location access will not affect core app functionality, but location-based features will not be available.`,
  },
  {
    title: '8. Camera & Media Access',
    body: `We request camera and photo library access to:\n\n• Capture vehicle photos for listings\n• Upload RC, insurance, and other documents\n• Take selfies for KYC verification\n\nImages uploaded to Auto Bidder are stored securely on our servers. Vehicle listing photos may be visible to other users. KYC documents are stored encrypted and are not publicly visible.`,
  },
  {
    title: '9. Push Notifications',
    body: `With your permission, we send push notifications for:\n\n• Outbid alerts and auction updates\n• Transaction confirmations\n• New listings matching your preferences\n• Important account and security alerts\n\nYou can manage notification preferences in the Settings section of the App or through your device's notification settings. Critical security notifications (like login alerts) cannot be disabled.`,
  },
  {
    title: '10. Cookies & Analytics',
    body: `The App uses analytics tools to understand how users interact with the platform. This includes:\n\n• Crash reporting to fix technical issues quickly\n• Feature usage analytics to improve the user experience\n• Performance monitoring\n\nThis data is aggregated and anonymized. We do not use tracking cookies for advertising purposes within the App.`,
  },
  {
    title: '11. Children\'s Privacy',
    body: `Auto Bidder is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors.\n\nIf we become aware that we have inadvertently collected personal data from a person under 18, we will promptly delete that information. If you believe we may have collected data from a minor, please contact us at privacy@autobidder.in.`,
  },
  {
    title: '12. Third-Party Links',
    body: `The App may contain links to third-party websites or services (e.g., RTO portals, payment gateways). These third parties have their own privacy policies, and we encourage you to review them.\n\nAuto Bidder is not responsible for the privacy practices or content of third-party services.`,
  },
  {
    title: '13. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make significant changes, we will:\n\n• Notify you via push notification or email\n• Display a prominent notice within the App\n• Update the "Last updated" date at the top of this policy\n\nYour continued use of the App after any changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: '14. Grievance Officer',
    body: `In accordance with the Information Technology Act, 2000, and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the name and contact details of our Grievance Officer are:\n\nName: Mr. Rajesh Kumar\nDesignation: Data Protection & Grievance Officer\nEmail: grievance@autobidder.in\nPhone: +91 98765 43210\nAddress: 123, Business Park, Sector 18, Gurugram, Haryana - 122001\n\nWe will acknowledge complaints within 24 hours and resolve them within 15 days.`,
  },
];

export default function PrivacyPolicy() {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBadge}>
          <Ionicons name="shield-checkmark" size={32} color={GREEN} />
        </View>
        <Text style={styles.pageTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: June 1, 2025</Text>
        <Text style={styles.intro}>
          At Auto Bidder, your privacy matters. This policy explains what data we collect, how we use it, and the choices you have regarding your information.
        </Text>

        <View style={styles.highlightRow}>
          {[
            { icon: 'lock-closed', label: 'Encrypted\nStorage' },
            { icon: 'eye-off', label: 'Never\nSold' },
            { icon: 'person-circle', label: 'You Own\nYour Data' },
          ].map((item) => (
            <View key={item.label} style={styles.highlightItem}>
              <Ionicons name={item.icon as any} size={22} color={GREEN} />
              <Text style={styles.highlightLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setExpanded(expanded === index ? null : index)}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons
                name={expanded === index ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={MUTED}
              />
            </Pressable>
            {expanded === index && (
              <Text style={styles.sectionBody}>{section.body}</Text>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Ionicons name="mail-outline" size={18} color={GREEN} style={{ marginBottom: 6 }} />
          <Text style={styles.footerText}>
            Questions about your privacy?{'\n'}Contact us at{' '}
            <Text style={styles.footerLink}>privacy@autobidder.in</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  content: { padding: 20, paddingBottom: 60 },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 16,
  },
  intro: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 8,
  },
  highlightItem: { alignItems: 'center', gap: 6 },
  highlightLabel: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 20 },
  sectionCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: BG,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    flex: 1,
    marginRight: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    padding: 16,
    paddingTop: 4,
    backgroundColor: '#fff',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
