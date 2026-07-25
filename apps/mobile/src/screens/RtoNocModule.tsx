import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import * as api from '../api';
import { COLORS } from '../theme';

const TEXT_DARK = '#0b1020';
const MUTED = '#6b7280';
const BLUE = COLORS.secondary;
const LINE = '#e5e7eb';

type Tab = 'rto' | 'noc';
type Status = 'Not started' | 'In progress' | 'Completed';
type NocItemKey = 'bank' | 'rto' | 'invoice' | 'id';

type NocItem = {
  key: NocItemKey;
  title: string;
  subtitle: string;
  required: boolean;
  status: Status;
  uploadedCount: number;
};

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function SelectLike({ value, placeholder, onPress }: { value?: string; placeholder: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.inputBox} onPress={onPress}>
      <Text style={value ? styles.inputText : styles.inputTextMuted}>{value ?? placeholder}</Text>
      <Ionicons name="chevron-down" size={18} color={MUTED} />
    </Pressable>
  );
}

function UploadBox({ title, subtitle, onPress }: { title: string; subtitle?: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.uploadBox} onPress={onPress}>
      <View style={styles.uploadIconWrap}>
        <Ionicons name="document-text-outline" size={18} color={BLUE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.uploadTitle}>{title}</Text>
        {subtitle ? <Text style={styles.uploadSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.uploadAction}>Upload</Text>
    </Pressable>
  );
}

function StatusPill({ status }: { status: Status }) {
  const s = useMemo(() => {
    switch (status) {
      case 'Completed':
        return { bg: '#ecfdf5', fg: '#047857', border: '#a7f3d0' };
      case 'In progress':
        return { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' };
      default:
        return { bg: '#f3f4f6', fg: '#374151', border: '#e5e7eb' };
    }
  }, [status]);

  return (
    <View style={[styles.statusPill, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.statusPillText, { color: s.fg }]}>{status}</Text>
    </View>
  );
}

export default function RtoNocModule() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const listingId = route.params?.listingId;

  const [tab, setTab] = useState<Tab>('rto');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // RTO form state
  const [rtoTaxStatus, setRtoTaxStatus] = useState<string | undefined>(undefined);
  const [rtoDues, setRtoDues] = useState('');
  const [rtoNocIssued, setRtoNocIssued] = useState<string | undefined>(undefined);

  // NOC checklist state
  const [nocItems, setNocItems] = useState<NocItem[]>([
    { key: 'bank', title: 'Bank NOC', subtitle: 'Required if hypothecation is active', required: false, status: 'Not started', uploadedCount: 0 },
    { key: 'rto', title: 'RTO NOC', subtitle: 'Needed for transfer / interstate cases', required: false, status: 'Not started', uploadedCount: 0 },
    { key: 'invoice', title: 'Invoice / Purchase Proof', subtitle: 'Helps validate ownership & variant', required: true, status: 'Not started', uploadedCount: 0 },
    { key: 'id', title: 'Owner ID Proof', subtitle: 'Aadhaar / PAN / DL (any one)', required: true, status: 'Not started', uploadedCount: 0 },
  ]);

  useEffect(() => {
    if (listingId) {
        setFetching(true);
        api.request<{ rtoNoc: any }>(`/api/listings/${listingId}/rto-noc`)
            .then((res: { rtoNoc: any }) => {
                if (res.rtoNoc) {
                    setRtoTaxStatus(res.rtoNoc.rtoTaxStatus);
                    setRtoDues(res.rtoNoc.rtoDues || '');
                    setRtoNocIssued(res.rtoNoc.rtoNocIssued);
                    // Map statuses from DB to UI
                    // (Simplification for demo)
                }
            })
            .catch((err: Error) => console.warn(err))
            .finally(() => setFetching(false));
    }
  }, [listingId]);

  const pickAndUpload = async (title: string) => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
        });

        if (!result.canceled && result.assets[0].uri) {
            setLoading(true);
            await api.uploadFile(result.assets[0].uri, result.assets[0].mimeType, result.assets[0].name || undefined);
            Alert.alert('Success', `${title} uploaded successfully.`);
        }
    } catch (err) {
        Alert.alert('Error', 'Upload failed');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!listingId) {
        Alert.alert('Info', 'RTO details saved locally for now.');
        return;
    }
    setLoading(true);
    try {
        await api.request(`/api/listings/${listingId}/rto-noc`, {
            method: 'PUT',
            body: JSON.stringify({
                rtoTaxStatus,
                rtoDues,
                rtoNocIssued,
            })
        });
        Alert.alert('Success', 'RTO & NOC details updated successfully.');
    } catch (err) {
        Alert.alert('Error', 'Failed to save details.');
    } finally {
        setLoading(false);
    }
  };

  const bumpUpload = (key: NocItemKey) => {
    setNocItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        const nextCount = it.uploadedCount + 1;
        return {
          ...it,
          uploadedCount: nextCount,
          status: nextCount > 0 ? 'In progress' : it.status,
        };
      }),
    );
  };

  const markStatus = (key: NocItemKey, status: Status) => {
    setNocItems((prev) => prev.map((it) => (it.key === key ? { ...it, status } : it)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={TEXT_DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>RTO & NOC</Text>
      </View>

      <View style={styles.tabsRow}>
        <Pressable style={[styles.tab, tab === 'rto' && styles.tabActive]} onPress={() => setTab('rto')}>
          <Text style={[styles.tabText, tab === 'rto' && styles.tabTextActive]}>RTO</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'noc' && styles.tabActive]} onPress={() => setTab('noc')}>
          <Text style={[styles.tabText, tab === 'noc' && styles.tabTextActive]}>NOC</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {fetching ? (
            <ActivityIndicator color={BLUE} style={{ marginTop: 40 }} />
        ) : tab === 'rto' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>RTO status</Text>
              <Text style={styles.cardSub}>
                Track tax status, dues, and whether an RTO NOC has been issued.
              </Text>

              <Label text="RTO Tax Status" />
              <SelectLike
                value={rtoTaxStatus}
                placeholder="Select (Paid / Due / Unknown)"
                onPress={() => {
                  setRtoTaxStatus((prev) => {
                    if (!prev || prev === 'Unknown') return 'Paid';
                    if (prev === 'Paid') return 'Due';
                    return 'Unknown';
                  });
                }}
              />

              <Label text="Any RTO dues / issues?" />
              <View style={[styles.inputBox, styles.inputBoxMulti]}>
                <TextInput
                  value={rtoDues}
                  onChangeText={setRtoDues}
                  placeholder="Type details (challan, tax pending, blacklist, etc.)"
                  placeholderTextColor={MUTED}
                  style={[styles.textInput, styles.textInputMulti]}
                  multiline
                />
              </View>

              <Label text="RTO NOC Issued" />
              <SelectLike
                value={rtoNocIssued}
                placeholder="Select (Yes / No / Not sure)"
                onPress={() => {
                  setRtoNocIssued((prev) => {
                    if (!prev || prev === 'Not sure') return 'Yes';
                    if (prev === 'Yes') return 'No';
                    return 'Not sure';
                  });
                }}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>RTO documents</Text>
              <Text style={styles.cardSub}>
                Upload RC and other RTO documents.
              </Text>
              <UploadBox title="Upload RC" subtitle="Front and back" onPress={() => pickAndUpload('RC')} />
              <UploadBox title="Upload RTO NOC (if any)" subtitle="PDF/JPG" onPress={() => pickAndUpload('RTO NOC')} />
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>SAVE RTO DETAILS</Text>}
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>NOC checklist</Text>
              <Text style={styles.cardSub}>
                Keep all required NOCs and proofs in one place.
              </Text>

              {nocItems.map((it) => (
                <View key={it.key} style={styles.nocRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nocRowTitleLine}>
                      <Text style={styles.nocTitle}>
                        {it.title}{' '}
                        {it.required ? <Text style={styles.required}>*</Text> : null}
                      </Text>
                      <StatusPill status={it.status} />
                    </View>
                    <Text style={styles.nocSubtitle}>{it.subtitle}</Text>

                    <View style={styles.nocActionsRow}>
                      <Pressable style={styles.smallBtn} onPress={() => pickAndUpload(it.title)}>
                        <Text style={styles.smallBtnText}>Upload ({it.uploadedCount})</Text>
                      </Pressable>
                      <Pressable style={styles.smallBtnGhost} onPress={() => markStatus(it.key, 'Completed')}>
                        <Text style={styles.smallBtnGhostText}>Mark Completed</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.divider} />

              <Pressable style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>REQUEST NOC SUPPORT</Text>
              </Pressable>
            </View>
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, marginLeft: 10 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: LINE, marginHorizontal: 16 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: TEXT_DARK },
  tabText: { fontSize: 16, fontWeight: '700', color: MUTED },
  tabTextActive: { color: TEXT_DARK },
  content: { padding: 16 },
  card: { borderWidth: 1, borderColor: LINE, backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK, marginBottom: 6 },
  cardSub: { fontSize: 14, color: MUTED, lineHeight: 18, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginTop: 14, marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', height: 48, borderWidth: 1, borderColor: LINE, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#ffffff' },
  inputBoxMulti: { height: 110, alignItems: 'flex-start', paddingTop: 12 },
  inputTextMuted: { flex: 1, fontSize: 14, color: MUTED },
  inputText: { flex: 1, fontSize: 14, color: TEXT_DARK, fontWeight: '600' },
  textInput: { flex: 1, fontSize: 14, color: TEXT_DARK, height: '100%' },
  textInputMulti: { textAlignVertical: 'top' },
  uploadBox: { borderWidth: 1, borderColor: LINE, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#ffffff' },
  uploadIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  uploadTitle: { color: TEXT_DARK, fontWeight: '800', fontSize: 14 },
  uploadSubtitle: { color: MUTED, fontSize: 12, marginTop: 2 },
  uploadAction: { color: BLUE, fontWeight: '800', fontSize: 14 },
  primaryBtn: { height: 50, borderRadius: 5, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryBtnText: { color: '#ffffff', fontWeight: '900', letterSpacing: 0.4 },
  nocRow: { borderWidth: 1, borderColor: LINE, borderRadius: 12, padding: 12, marginTop: 10, backgroundColor: '#ffffff' },
  nocRowTitleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nocTitle: { color: TEXT_DARK, fontWeight: '900', fontSize: 14, flexShrink: 1 },
  required: { color: '#ef4444' },
  nocSubtitle: { color: MUTED, fontSize: 12, lineHeight: 16, marginTop: 4 },
  nocActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  smallBtn: { paddingHorizontal: 12, height: 34, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  smallBtnText: { color: BLUE, fontWeight: '900', fontSize: 12 },
  smallBtnGhost: { paddingHorizontal: 10, height: 34, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  smallBtnGhostText: { color: '#111827', fontWeight: '800', fontSize: 12 },
  statusPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 12, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
});
