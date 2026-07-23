import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, FONTS } from '../theme';

const CONTACT_CHANNELS = [
  {
    icon: 'logo-whatsapp' as const,
    IconComp: 'Ionicons' as const,
    label: 'WhatsApp',
    sub: 'Fastest response',
    color: '#25D366',
    bg: '#E8FBF0',
    action: () => Linking.openURL('https://wa.me/919999999999'),
  },
  {
    icon: 'call-outline' as const,
    IconComp: 'Ionicons' as const,
    label: 'Call Us',
    sub: 'Mon–Sat 9am–7pm',
    color: COLORS.secondary,
    bg: '#EFF6FF',
    action: () => Linking.openURL('tel:+919999999999'),
  },
  {
    icon: 'mail-outline' as const,
    IconComp: 'Ionicons' as const,
    label: 'Email',
    sub: 'Reply in 24 hrs',
    color: '#F59E0B',
    bg: '#FFFBEB',
    action: () => Linking.openURL('mailto:support@autobidder.in'),
  },
];

const TOPICS = [
  {
    icon: 'rocket-outline' as const,
    title: 'Getting Started',
    desc: 'Account setup, onboarding & first steps',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    items: [
      'How do I create an account?',
      'What is KYC verification and why is it needed?',
      'How do I update my profile information?',
      'Can I use the app without KYC?',
    ],
  },
  {
    icon: 'car-outline' as const,
    title: 'Buying a Car',
    desc: 'Bidding, auctions & winning a deal',
    color: COLORS.secondary,
    bg: '#EFF6FF',
    items: [
      'How do I place a bid?',
      'What is Auto Bidder and how does it work?',
      'How do I schedule a car inspection?',
      'What happens after I win an auction?',
      'Can I cancel a bid?',
    ],
  },
  {
    icon: 'cash-outline' as const,
    title: 'Selling a Car',
    desc: 'Listing, pricing & managing your sale',
    color: '#10B981',
    bg: '#ECFDF5',
    items: [
      'How do I list my car for sale?',
      'What selling timeline should I choose?',
      'How do I set the minimum bid?',
      'When will I receive payment after a sale?',
      'Can I cancel or pause my listing?',
    ],
  },
  {
    icon: 'card-outline' as const,
    title: 'Payments & Wallet',
    desc: 'Deposits, refunds & bank transfers',
    color: '#F59E0B',
    bg: '#FFFBEB',
    items: [
      'How do I add money to my wallet?',
      'When is the security deposit refunded?',
      'How do I link my bank account?',
      'How long do refunds take?',
    ],
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Safety & Security',
    desc: 'Account safety, fraud & data privacy',
    color: '#EF4444',
    bg: '#FEF2F2',
    items: [
      'How is my payment information protected?',
      'What should I do if I suspect fraud?',
      'How do I report a suspicious listing?',
      'How do I delete my account?',
    ],
  },
  {
    icon: 'document-text-outline' as const,
    title: 'RC & Documentation',
    desc: 'Transfer, RTO & ownership papers',
    color: '#6366F1',
    bg: '#EEF2FF',
    items: [
      'How does RC transfer work?',
      'What documents do I need as a seller?',
      'How long does ownership transfer take?',
      'What is Form 29 / Form 30?',
    ],
  },
];

export default function HelpCenter() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = TOPICS.map(t => ({
    ...t,
    items: t.items.filter(q =>
      q.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(t => t.items.length > 0 || search === '');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset-outline" size={36} color={COLORS.secondary} />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Search topics or browse categories below</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help topics..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* Contact channels */}
        {search.length === 0 && (
          <>
            <Text style={styles.sectionLabel}>Contact Support</Text>
            <View style={styles.channelRow}>
              {CONTACT_CHANNELS.map(ch => (
                <Pressable key={ch.label} style={[styles.channelCard, { backgroundColor: ch.bg }]} onPress={ch.action}>
                  <View style={[styles.channelIconWrap, { backgroundColor: ch.color + '22' }]}>
                    <Ionicons name={ch.icon} size={22} color={ch.color} />
                  </View>
                  <Text style={[styles.channelLabel, { color: ch.color }]}>{ch.label}</Text>
                  <Text style={styles.channelSub}>{ch.sub}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Topics */}
        <Text style={styles.sectionLabel}>{search.length > 0 ? 'Search Results' : 'Browse Topics'}</Text>

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No results for "{search}"</Text>
            <Text style={styles.emptySub}>Try a different keyword or browse the topics below</Text>
          </View>
        )}

        {filtered.map(topic => {
          const isOpen = expanded === topic.title;
          return (
            <View key={topic.title} style={styles.topicCard}>
              <Pressable
                style={styles.topicHeader}
                onPress={() => setExpanded(isOpen ? null : topic.title)}
              >
                <View style={[styles.topicIcon, { backgroundColor: topic.bg }]}>
                  <Ionicons name={topic.icon} size={20} color={topic.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDesc}>{topic.desc}</Text>
                </View>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#94A3B8"
                />
              </Pressable>

              {isOpen && (
                <View style={styles.topicItems}>
                  {topic.items.map((q, i) => (
                    <Pressable
                      key={i}
                      style={[styles.topicItem, i === 0 && styles.topicItemFirst]}
                      onPress={() => navigation.navigate('FAQ')}
                    >
                      <Ionicons name="help-circle-outline" size={16} color={topic.color} style={{ marginRight: 10 }} />
                      <Text style={styles.topicItemText}>{q}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* FAQ shortcut */}
        {search.length === 0 && (
          <Pressable style={styles.faqBanner} onPress={() => navigation.navigate('FAQ')}>
            <View style={styles.faqBannerLeft}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.secondary} />
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.faqBannerTitle}>View All FAQs</Text>
                <Text style={styles.faqBannerSub}>14 answers to common questions</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={COLORS.secondary} />
          </Pressable>
        )}

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

  scroll: { padding: 16, paddingTop: 8 },

  hero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: FONTS.poppins.bold,
    color: '#1E293B',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: FONTS.poppins.medium,
    color: '#64748B',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.poppins.medium,
    color: '#1E293B',
    paddingVertical: 0,
  },

  sectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.poppins.bold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  channelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  channelCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  channelIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  channelLabel: {
    fontSize: 13,
    fontFamily: FONTS.poppins.bold,
    marginBottom: 2,
  },
  channelSub: {
    fontSize: 11,
    fontFamily: FONTS.poppins.medium,
    color: '#94A3B8',
    textAlign: 'center',
  },

  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
    color: '#1E293B',
    marginBottom: 2,
  },
  topicDesc: {
    fontSize: 12,
    fontFamily: FONTS.poppins.medium,
    color: '#94A3B8',
  },

  topicItems: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  topicItemFirst: {
    borderTopWidth: 0,
  },
  topicItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.poppins.medium,
    color: '#334155',
    lineHeight: 20,
  },

  faqBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  faqBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqBannerTitle: {
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
    color: '#1E40AF',
  },
  faqBannerSub: {
    fontSize: 12,
    fontFamily: FONTS.poppins.medium,
    color: '#3B82F6',
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.poppins.bold,
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: FONTS.poppins.medium,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
