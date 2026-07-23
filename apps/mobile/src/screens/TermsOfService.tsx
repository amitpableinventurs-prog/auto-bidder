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
import { COLORS } from '../theme';

const DARK = '#0f172a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const BLUE = COLORS.secondary;
const BG = '#f8fafc';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By downloading, accessing, or using the Auto Bidder application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the App.\n\nThese Terms constitute a legally binding agreement between you and Auto Bidder Technologies Pvt. Ltd. ("Company", "we", "our", or "us"). We reserve the right to update these Terms at any time, and your continued use of the App constitutes acceptance of any changes.`,
  },
  {
    title: '2. Eligibility',
    body: `To use the App, you must:\n\n• Be at least 18 years of age\n• Be a citizen or legal resident of India\n• Have a valid government-issued ID\n• Possess a valid phone number capable of receiving OTPs\n• Not be prohibited from using our services under any applicable law\n\nBy using the App, you represent and warrant that you meet all eligibility requirements.`,
  },
  {
    title: '3. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to:\n\n• Provide accurate and complete registration information\n• Keep your contact details up to date\n• Not share your account with any third party\n• Notify us immediately of any unauthorized access to your account\n\nWe reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.`,
  },
  {
    title: '4. Buying & Selling Vehicles',
    body: `Auto Bidder is a platform that facilitates the buying and selling of used vehicles through live auctions and direct listings.\n\nSellers:\n• Must be the registered owner of the vehicle or have legal authority to sell it\n• Must provide accurate information about the vehicle's condition, documentation, and history\n• Are responsible for ensuring all RC, NOC, and insurance documents are valid\n\nBuyers:\n• Acknowledge that vehicles are sold "as inspected" after our verification process\n• Are responsible for completing due diligence before placing bids\n• Are bound by their winning bid and must complete payment within the stipulated time`,
  },
  {
    title: '5. Auction Rules',
    body: `All auctions conducted on Auto Bidder are governed by the following rules:\n\n• All bids are final and legally binding once placed\n• The highest bid at the close of the auction wins\n• Auto Bidder reserves the right to cancel an auction in case of suspected fraud or technical error\n• Sellers may set a reserve price; if not met, no sale obligation exists\n• Winning bidders must complete payment within 48 hours of auction close\n• Failure to complete payment may result in account suspension and forfeiture of any deposit paid`,
  },
  {
    title: '6. Fees & Payments',
    body: `Auto Bidder charges the following fees:\n\n• Listing Fee: As applicable per listing plan\n• Buyer's Premium: A percentage of the final hammer price charged to the buyer\n• Platform Service Fee: Charged for facilitation of inspection, documentation, and transfer\n\nAll payments are processed through our secure payment gateway. Auto Bidder is not responsible for any banking charges, exchange rate fluctuations, or payment failures caused by your bank or payment provider.\n\nRefunds are subject to our Refund Policy, which is available on our website.`,
  },
  {
    title: '7. KYC & Verification',
    body: `To ensure a safe and compliant marketplace, all users must complete KYC (Know Your Customer) verification before participating in auctions or listing vehicles. This includes:\n\n• Government-issued photo ID (Aadhaar, PAN, Driving Licence, or Passport)\n• Proof of address\n• A selfie for identity verification\n\nAuto Bidder complies with applicable RBI and regulatory guidelines. Your KYC data is securely stored and not shared with third parties except as required by law.`,
  },
  {
    title: '8. Prohibited Activities',
    body: `You agree NOT to:\n\n• Post false, misleading, or fraudulent listings\n• Manipulate auction prices through shill bidding or collusion\n• Use the App for any unlawful purpose\n• Attempt to reverse-engineer, scrape, or copy the App\n• Harass, threaten, or abuse other users or Auto Bidder staff\n• Use the platform to sell stolen or encumbered vehicles\n• Create multiple accounts to circumvent restrictions\n\nViolation of these rules may result in immediate account termination and legal action.`,
  },
  {
    title: '9. Inspections & Condition Reports',
    body: `Auto Bidder provides inspection and condition report services to help buyers make informed decisions. However:\n\n• Inspection reports are advisory in nature and not a guarantee of the vehicle's condition\n• Auto Bidder is not liable for undisclosed defects not apparent during inspection\n• Buyers are strongly encouraged to conduct their own inspection before bidding\n• Auto Bidder's liability in case of inspection errors is limited to the cost of the inspection fee paid`,
  },
  {
    title: '10. Intellectual Property',
    body: `All content on the App, including but not limited to logos, design, text, graphics, and software, is the exclusive property of Auto Bidder Technologies Pvt. Ltd. and is protected by applicable intellectual property laws.\n\nYou may not reproduce, distribute, or create derivative works from any content without our prior written consent.`,
  },
  {
    title: '11. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, Auto Bidder shall not be liable for:\n\n• Any indirect, incidental, or consequential damages arising from your use of the App\n• Loss of profit, data, or business opportunity\n• Disputes between buyers and sellers\n• Technical failures, downtime, or data loss\n\nAuto Bidder's total aggregate liability shall not exceed the total fees paid by you in the six months preceding the claim.`,
  },
  {
    title: '12. Governing Law & Disputes',
    body: `These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.\n\nBefore initiating any legal proceedings, both parties agree to attempt resolution through good-faith negotiation for a period of 30 days.`,
  },
  {
    title: '13. Contact Us',
    body: `If you have any questions about these Terms of Service, please contact us:\n\nAuto Bidder Technologies Pvt. Ltd.\nEmail: legal@autobidder.in\nPhone: +91 98765 43210\nAddress: 123, Business Park, Sector 18, Gurugram, Haryana - 122001`,
  },
];

export default function TermsOfService() {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBadge}>
          <Ionicons name="document-text" size={32} color={BLUE} />
        </View>
        <Text style={styles.pageTitle}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: June 1, 2025</Text>
        <Text style={styles.intro}>
          Please read these Terms of Service carefully before using the Auto Bidder app. These terms govern your use of our vehicle auction and buying/selling platform.
        </Text>

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
          <Text style={styles.footerText}>
            By using Auto Bidder, you acknowledge that you have read, understood, and agree to these Terms of Service.
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
    backgroundColor: '#eff6ff',
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
    marginBottom: 8,
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
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: BLUE,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
