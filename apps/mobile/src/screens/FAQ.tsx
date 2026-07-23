import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../theme';

const CATEGORIES = [
  {
    section: 'Buying a Car',
    icon: 'car-outline' as const,
    items: [
      {
        q: 'How do I bid on a car?',
        a: "Open any active listing and tap 'Place Bid'. Enter your amount — it must be above the current highest bid — then tap 'CONFIRM BID'. You can also use the quick +₹5k / +₹10k / +₹25k / +₹50k buttons to raise your bid instantly.",
      },
      {
        q: 'What is Auto Bidder?',
        a: "Auto Bidder automatically places bids on your behalf up to a maximum amount you set, so you stay competitive even when you're not watching the auction. You can update or cancel it at any time before the auction ends.",
      },
      {
        q: 'How does the auction timeline work?',
        a: "Each listing shows a countdown timer. When it reaches zero the highest bidder wins. If a bid is placed in the final 2 minutes the timer resets to 2 minutes, giving all buyers a fair chance to respond.",
      },
      {
        q: 'Can I inspect the car before bidding?',
        a: "Yes. Tap 'Schedule Meeting' on any listing to book an inspection appointment with the seller. You can also request a third-party inspection report through the app.",
      },
      {
        q: 'What happens after I win an auction?',
        a: 'You will receive a notification and our team will contact you within 24 hours to complete the paperwork, transfer ownership, and arrange delivery or pickup. The security deposit is applied toward the final price.',
      },
      {
        q: 'Is the car inspected before listing?',
        a: 'Every car on Auto Bidder goes through our verification process. The seller provides full details and photos. Listings marked with a "Verified" badge have been checked by our team or a certified third-party inspector.',
      },
    ],
  },
  {
    section: 'Selling a Car',
    icon: 'cash-outline' as const,
    items: [
      {
        q: 'How do I list my car for sale?',
        a: "Tap 'Sell Car' in the bottom navigation. Fill in your car's registration number, select brand, model, and other details, then upload photos. Our team will review and approve your listing within 24 hours.",
      },
      {
        q: 'What selling timelines are available?',
        a: "You can choose from: CashMyCar Instant (same day offer), 7 Days, 15 Days, 30 Days, or 2–3 Months. Shorter timelines are better for urgent sales; longer timelines attract more bidders and generally yield higher prices.",
      },
      {
        q: 'How is the minimum starting bid set?',
        a: "You set the minimum bid yourself when creating the auction. Our team may suggest a range based on current market data for your car's make, model, year, and condition. Buyers cannot bid below this amount.",
      },
      {
        q: 'When do I receive payment?',
        a: 'Payment is processed within 3–5 business days after the winning buyer completes the RC transfer and ownership documentation. Funds are transferred directly to your registered bank account.',
      },
      {
        q: 'Can I cancel my listing?',
        a: "Yes, you can cancel an unsold listing before the auction ends from your Seller Dashboard. If a buyer has already won, cancellation is subject to our seller terms and a small fee may apply.",
      },
    ],
  },
  {
    section: 'Account & Safety',
    icon: 'shield-checkmark-outline' as const,
    items: [
      {
        q: 'Is my payment information secure?',
        a: 'Yes. Auto Bidder uses industry-standard TLS encryption for all transactions. We do not store card details — payments are processed through PCI-DSS compliant gateways.',
      },
      {
        q: 'How do I complete KYC verification?',
        a: "Go to your Profile and tap 'Complete KYC'. You will need to upload a valid government-issued ID (Aadhaar, PAN, or Passport) and a selfie. Verification is usually completed within 2 hours.",
      },
      {
        q: 'How do I update my phone number?',
        a: 'Phone numbers are linked to your OTP login and cannot be changed from within the app. Please contact our support team via WhatsApp or the Help Centre to request a phone number update.',
      },
    ],
  },
];

export default function FAQ() {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpandedSection(prev => (prev === key ? null : key));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Everything you need to know about Auto Bidder</Text>

        {CATEGORIES.map(cat => (
          <View key={cat.section} style={styles.categoryBlock}>
            {/* Section header */}
            <View style={styles.sectionRow}>
              <View style={styles.sectionIcon}>
                <Ionicons name={cat.icon} size={18} color={COLORS.secondary} />
              </View>
              <Text style={styles.sectionTitle}>{cat.section}</Text>
            </View>

            {/* Items */}
            <View style={styles.card}>
              {cat.items.map((item, i) => {
                const key = `${cat.section}-${i}`;
                const open = expandedSection === key;
                return (
                  <View key={key}>
                    <Pressable
                      style={styles.row}
                      onPress={() => toggle(key)}
                    >
                      <Text style={[styles.question, open && styles.questionOpen]}>
                        {item.q}
                      </Text>
                      <Ionicons
                        name={open ? 'remove' : 'add'}
                        size={22}
                        color={open ? COLORS.secondary : '#94A3B8'}
                      />
                    </Pressable>

                    {open && (
                      <View style={styles.answerBox}>
                        <Text style={styles.answer}>{item.a}</Text>
                      </View>
                    )}

                    {i < cat.items.length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Contact prompt */}
        <View style={styles.contactBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Still have questions?</Text>
            <Text style={styles.contactSub}>Chat with our support team on WhatsApp — we reply within minutes.</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: '#1E293B',
  },

  scroll: { padding: 16, paddingTop: 20 },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: FONTS.poppins.medium,
    marginBottom: 24,
    textAlign: 'center',
  },

  categoryBlock: { marginBottom: 24 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.poppins.bold,
    color: '#1E293B',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.poppins.medium,
    color: '#334155',
    lineHeight: 21,
  },
  questionOpen: {
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.bold,
  },

  answerBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 2,
  },
  answer: {
    fontSize: 13,
    fontFamily: FONTS.openSans ? FONTS.openSans.regular : FONTS.poppins.regular,
    color: '#64748B',
    lineHeight: 22,
  },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  contactBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
    color: '#1E40AF',
    marginBottom: 3,
  },
  contactSub: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: FONTS.poppins.medium,
    lineHeight: 18,
  },
});
