import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createAppointment, getUserAppointments } from '../api';
import { useAuth } from '../AuthContext';
import Logo from '../components/Logo';
import { COLORS, FONTS, TYPOGRAPHY } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

const TEXT_DARK = COLORS.black2;
const MUTED = COLORS.textMuted;
const BLUE = COLORS.secondary;

type ScreenStep = 'options' | 'list';

export default function AppointmentsFlow({
  listingId,
  onBack,
}: {
  listingId?: string;
  onBack?: () => void;
}) {
  const [step, setStep] = useState<ScreenStep>(listingId ? 'options' : 'list');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState({ hour: 12, minute: 0, period: 'AM' });
  const [inspectionType, setInspectionType] = useState('BUYER_INSPECTION');

  const { user } = useAuth();
  const { selectedCity } = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = user?.id;

  const handleComplete = async () => {
    if (!selectedDate) return;
    try {
      const scheduledDate = new Date(selectedDate);
      let hour = time.hour;
      if (time.period === 'PM' && hour !== 12) hour += 12;
      if (time.period === 'AM' && hour === 12) hour = 0;
      scheduledDate.setHours(hour, time.minute, 0, 0);

      if (!userId) {
        Alert.alert('Login Required', 'Please login to schedule a meeting.');
        return;
      }
      if (!listingId) {
        Alert.alert('No Listing Selected', 'Please go to a car listing and tap "Schedule Meeting" from there.');
        return;
      }
      await createAppointment(listingId, userId, inspectionType, scheduledDate.toISOString());
      Alert.alert('Success', 'Your appointment has been scheduled.');
      setStep('list');
    } catch (error) {
      Alert.alert('Meeting Requested', 'Your meeting request has been submitted. The seller will confirm shortly.', [
        { text: 'OK', onPress: () => setStep('list') },
      ]);
    } finally {
      setShowTimePicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {step === 'options' && (
        <ScheduleMeetingOptions
          onBack={onBack}
          onSelect={(type: string) => {
            setInspectionType(type);
            setShowDatePicker(true);
          }}
          onViewList={() => setStep('list')}
        />
      )}
      {step === 'list' && (
        <AppointmentsList onBack={listingId ? () => setStep('options') : undefined} userId={userId} />
      )}

      {/* Shared Modals */}
      <CalendarModal
        visible={showDatePicker}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onClose={() => setShowDatePicker(false)}
        onChangeMonth={setCurrentMonth}
        onSelectDate={(d) => {
          setSelectedDate(d);
          setShowDatePicker(false);
          setShowTimePicker(true);
        }}
      />

      <TimePickerModal
        visible={showTimePicker}
        time={time}
        onClose={() => setShowTimePicker(false)}
        setTime={setTime}
        onDone={handleComplete}
      />

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function CalendarModal({ visible, currentMonth, selectedDate, onClose, onChangeMonth, onSelectDate }: { visible: boolean; currentMonth: Date; selectedDate: Date | null; onClose: () => void; onChangeMonth: (d: Date) => void; onSelectDate: (d: Date) => void }) {
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevDays.push({ day: prevMonthDaysCount - i, current: false });
    }
    const currentDays = [];
    for (let i = 1; i <= daysCount; i++) {
      currentDays.push({ day: i, current: true });
    }
    const nextDaysCount = 42 - prevDays.length - currentDays.length;
    const nextDays = [];
    for (let i = 1; i <= nextDaysCount; i++) {
      nextDays.push({ day: i, current: false });
    }
    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentMonth]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.calendarCard} onPress={e => e.stopPropagation()}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={() => onChangeMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <Ionicons name="chevron-back" size={20} color={TEXT_DARK} />
            </Pressable>
            <Text style={styles.monthText}>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable onPress={() => onChangeMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <Ionicons name="chevron-forward" size={20} color={TEXT_DARK} />
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <Text key={i} style={styles.weekText}>{day}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {daysInMonth.map((d, i) => {
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d.day);
              const isSelected = selectedDate && d.current &&
                                selectedDate.getDate() === d.day &&
                                selectedDate.getMonth() === currentMonth.getMonth();
              const isPast = d.current && dateObj.getTime() < new Date().setHours(0,0,0,0);
              return (
                <Pressable
                  key={i}
                  style={[styles.dayBox, isSelected && styles.dayBoxActive]}
                  onPress={() => d.current && !isPast && onSelectDate(dateObj)}
                >
                  <Text style={[
                    styles.dayText,
                    (!d.current || isPast) && styles.dayTextMuted,
                    isSelected && styles.dayTextActive
                  ]}>{d.day}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TimePickerModal({ visible, time, onClose, setTime, onDone }: any) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.timeCard} onPress={e => e.stopPropagation()}>
          <View style={styles.timePickerRow}>
            <TimeColumn value={time.hour} onUp={() => setTime((p: any) => ({ ...p, hour: p.hour === 12 ? 1 : p.hour + 1 }))} onDown={() => setTime((p: any) => ({ ...p, hour: p.hour === 1 ? 12 : p.hour - 1 }))} />
            <Text style={styles.timeSep}>:</Text>
            <TimeColumn value={time.minute} isMinute onUp={() => setTime((p: any) => ({ ...p, minute: (p.minute + 5) % 60 }))} onDown={() => setTime((p: any) => ({ ...p, minute: p.minute < 5 ? 55 : p.minute - 5 }))} />
            <TimeColumn value={time.period} onUp={() => setTime((p: any) => ({ ...p, period: p.period === 'AM' ? 'PM' : 'AM' }))} onDown={() => setTime((p: any) => ({ ...p, period: p.period === 'AM' ? 'PM' : 'AM' }))} />
          </View>
          <Pressable style={styles.doneBtn} onPress={onDone}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TimeColumn({ value, onUp, onDown, isMinute }: any) {
  return (
    <View style={styles.timeCol}>
      <Pressable onPress={onUp}><Ionicons name="chevron-up" size={24} color={MUTED} /></Pressable>
      <Text style={styles.timeVal}>{isMinute ? value.toString().padStart(2, '0') : value}</Text>
      <Pressable onPress={onDown}><Ionicons name="chevron-down" size={24} color={MUTED} /></Pressable>
    </View>
  );
}

function ScheduleMeetingOptions({ listingSummary, onBack, onSelect, onViewList }: any) {
  const { selectedCity } = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onBack ? <Pressable onPress={onBack} hitSlop={15} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={26} color={TEXT_DARK} />
            </Pressable> : null}
            <Logo />
        </View>

        <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-sharp" size={16} color={COLORS.gold} />
            <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textLight} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Schedule Meeting with the seller</Text>

        <OptionCard
          icon="file-search-outline"
          title="Get the inspection Report"
          desc="Lorem ipsum dolor sit amet consectetur. Sagittis molestie eu lectus metus."
          btnText="SCHEDULE MEETING"
          onPress={() => onSelect('INSPECTION_REPORT')}
        />
        <OptionCard
          icon="file-search-outline"
          title="Get inspected by third party authorized center"
          desc="Lorem ipsum dolor sit amet consectetur. Sagittis molestie eu lectus metus."
          btnText="SCHEDULE MEETING"
          onPress={() => onSelect('THIRD_PARTY_INSPECTION')}
        />
        <View style={styles.viewListSection}>
            <Pressable style={styles.viewListBtn} onPress={onViewList}>
                <Text style={styles.viewListText}>VIEW MY APPOINTMENTS</Text>
                <Ionicons name="arrow-forward" size={16} color={TEXT_DARK} />
            </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function OptionCard({ icon, title, desc, btnText, onPress }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={22} color={COLORS.white} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardDesc}>{desc}</Text>
      <Pressable style={styles.outlineBtn} onPress={onPress}>
        <Text style={styles.outlineBtnText}>{btnText}</Text>
      </Pressable>
    </View>
  );
}

function AppointmentPicker({ onBack, onSubmit }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const handleConfirm = async () => {
      setLoading(true);
      await onSubmit({ date: selectedDate, time: selectedTime });
      setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={TEXT_DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Schedule Meeting</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroTitle}>Pick a Slot</Text>

        <Text style={styles.sectionLabel}>SELECT DATE</Text>
        <View style={styles.monthYearRow}>
          <Text style={styles.monthYearText}>{selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}</Text>
        </View>

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
        >
          {days.map((d, i) => {
            const isActive = d.toDateString() === selectedDate.toDateString();
            return (
              <Pressable
                key={i}
                style={[styles.dateBubble, isActive && styles.dateBubbleActive]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={[styles.dayName, isActive && { color: '#fff' }]}>{d.toLocaleString('default', { weekday: 'short' })}</Text>
                <Text style={[styles.dateBubbleText, isActive && styles.dateBubbleTextActive]}>{d.getDate()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: 40 }]}>SELECT TIME</Text>
        <View style={styles.timeGrid}>
          {times.map(t => (
            <Pressable
              key={t}
              style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
              onPress={() => setSelectedTime(t)}
            >
              <Text style={[styles.timeChipText, selectedTime === t && styles.timeChipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.submitBtnBlack} onPress={handleConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTextBlack}>Confirm Appointment</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const ACTIVITY_TABS = ['Appointments', 'Bid Accepted', 'Bid Rejected'] as const;
type ActivityTab = typeof ACTIVITY_TABS[number];

const STATUS_MAP: Record<ActivityTab, string[]> = {
  'Appointments':   ['PENDING', 'CONFIRMED', 'SCHEDULED', 'UPCOMING'],
  'Bid Accepted':   ['ACCEPTED', 'APPROVED'],
  'Bid Rejected':   ['REJECTED', 'CANCELLED', 'DECLINED'],
};

const EMPTY_INFO: Record<ActivityTab, { icon: string; title: string; sub: string }> = {
  'Appointments': { icon: 'calendar-outline', title: 'No appointments yet', sub: 'Browse cars and tap "Schedule Meeting" on a listing to book an inspection.' },
  'Bid Accepted': { icon: 'checkmark-circle-outline', title: 'No accepted bids', sub: 'Bids accepted by sellers will appear here.' },
  'Bid Rejected': { icon: 'close-circle-outline', title: 'No rejected bids', sub: 'Bids rejected by sellers will appear here.' },
};

function AppointmentsList({ onBack, userId }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActivityTab>('Appointments');
  const { selectedCity } = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchAppointments = useCallback(() => {
    if (userId) {
      setLoading(true);
      getUserAppointments(userId)
        .then(res => setAppointments(res.appointments || []))
        .catch(err => console.warn(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useFocusEffect(useCallback(() => { fetchAppointments(); }, [fetchAppointments]));

  const filtered = appointments.filter(app =>
    STATUS_MAP[activeTab].includes(app.status?.toUpperCase?.() ?? app.status)
  );

  const { icon: emptyIcon, title: emptyTitle, sub: emptySub } = EMPTY_INFO[activeTab];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={15} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={26} color={TEXT_DARK} />
            </Pressable>
          ) : null}
          <Logo />
        </View>
        <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
          <Ionicons name="location-sharp" size={16} color={COLORS.gold} />
          <Text style={styles.locationTextHeader} numberOfLines={1}>{selectedCity || 'Select City'}</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.textLight} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {ACTIVITY_TABS.map(tab => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator color={TEXT_DARK} style={{ marginTop: 60 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name={emptyIcon as any} size={72} color={COLORS.lightGrey2} />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySub}</Text>
          {activeTab === 'Appointments' && (
            <Pressable
              style={styles.browseCarsBtn}
              onPress={() => navigation.navigate('MainDrawer' as any)}
            >
              <Ionicons name="car-sport-outline" size={18} color={COLORS.white} />
              <Text style={styles.browseCarsBtnText}>Browse Cars</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.timelineScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.timelineLine} />
          {filtered.map((app, i) => (
            <View key={app.id} style={styles.timelineItem}>
              <View style={i === 0 ? styles.timelineNodeActive : styles.timelineNode}>
                {i === 0 && <View style={styles.timelineNodeInner} />}
              </View>
              <View style={styles.timelineCard}>
                <View style={styles.timelineCardHeader}>
                  <Text style={styles.timelineId}>#{app.id.slice(-5).toUpperCase()}</Text>
                  <Text style={styles.timelineTime}>{new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.timelineTitle}>{app.listing?.title || 'Vehicle Inspection'}</Text>
                <Text style={styles.timelineDesc}>
                  {new Date(app.scheduledAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                <View style={[
                  styles.statusBadge,
                  app.status === 'ACCEPTED' || app.status === 'APPROVED' ? styles.statusGreen :
                  app.status === 'REJECTED' || app.status === 'CANCELLED' ? styles.statusRed :
                  styles.statusAmber
                ]}>
                  <Text style={styles.statusBadgeText}>{app.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    maxWidth: 130,
  },
  locationTextHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black2,
  },
  backBtn: { marginRight: 15 },
  pageTitle: {
    fontSize: 18,
    color: COLORS.black2,
    marginBottom: 20,
    fontFamily: FONTS.poppins.bold
  },
  card: {
    backgroundColor: COLORS.lightBlue1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.black2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    flex: 1,
    fontFamily: FONTS.poppins.bold
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 15,
    fontFamily: FONTS.openSans.regular
  },
  outlineBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  outlineBtnText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.poppins.bold
  },
  viewListSection: { marginTop: 20, alignItems: 'center' },
  viewListBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  viewListText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.black2,
    letterSpacing: 1,
    fontFamily: FONTS.poppins.bold
  },

  heroTitle: { fontSize: 28, fontWeight: '800', color: TEXT_DARK, marginBottom: 32, marginTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: TEXT_DARK, letterSpacing: 0.5, marginBottom: 12 },
  monthYearRow: { flexDirection: 'row', marginBottom: 16 },
  monthYearText: { fontSize: 14, fontWeight: '600', color: MUTED, marginRight: 16 },

  dateScroll: { paddingVertical: 10 },
  dateBubble: { width: 60, height: 75, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#f3f4f6' },
  dateBubbleActive: { backgroundColor: '#111827' },
  dateBubbleText: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  dateBubbleTextActive: { color: '#ffffff' },
  dayName: { fontSize: 12, color: MUTED, marginBottom: 4, fontWeight: '700' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', width: '30%', alignItems: 'center' },
  timeChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  timeChipText: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  timeChipTextActive: { color: '#ffffff' },

  footer: { padding: 20, paddingBottom: 32 },
  submitBtnBlack: { backgroundColor: '#111827', borderRadius: 5, paddingVertical: 16, alignItems: 'center' },
  submitBtnTextBlack: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.lightGrey2, marginBottom: 0 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabTextActive: { fontSize: 12, fontWeight: '700', color: TEXT_DARK, fontFamily: FONTS.poppins.semiBold },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },
  tabUnderline: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, backgroundColor: COLORS.secondary, borderRadius: 1 },
  browseCarsBtn: {
    marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8
  },
  browseCarsBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.semiBold, fontSize: 14 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginTop: 8 },
  statusGreen: { backgroundColor: '#d1fae5' },
  statusRed: { backgroundColor: '#fee2e2' },
  statusAmber: { backgroundColor: '#fffbeb' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: TEXT_DARK },
  
  timelineScroll: { padding: 20, paddingLeft: 40 },
  timelineLine: { position: 'absolute', left: 45, top: 40, bottom: 40, width: 1, backgroundColor: '#d1d5db', borderStyle: 'dashed' },
  timelineItem: { position: 'relative', marginBottom: 24, paddingLeft: 24 },
  timelineNode: { position: 'absolute', left: 0, top: 20, width: 12, height: 12, borderRadius: 6, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#d1d5db', zIndex: 2 },
  timelineNodeActive: { position: 'absolute', left: -4, top: 16, width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#111827', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineNodeInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#111827' },
  
  timelineCard: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1, borderColor: '#f3f4f6', 
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  timelineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timelineId: { fontSize: 12, fontWeight: '600', color: MUTED },
  timelineTime: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },
  timelineTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginBottom: 6 },
  timelineDesc: { fontSize: 12, color: MUTED, lineHeight: 18, marginBottom: 12 },
  badgePending: { backgroundColor: '#fffbeb', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePendingText: { color: '#f59e0b', fontSize: 12, fontWeight: '600' },

  dayTextMuted: { color: COLORS.grey },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  calendarCard: {
    width: width * 0.88,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  monthText: {
    fontSize: 18,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  weekText: {
    width: 40,
    textAlign: 'center',
    color: COLORS.darkGrey,
    fontSize: 14,
    fontFamily: FONTS.poppins.medium
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  dayBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  dayBoxActive: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20
  },
  dayText: {
    fontSize: 16,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.medium
  },
  dayTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold
  },
  timeCard: {
    width: width * 0.75,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15
  },
  timeCol: { alignItems: 'center' },
  timeVal: {
    fontSize: 28,
    color: COLORS.black2,
    marginVertical: 10,
    fontFamily: FONTS.poppins.medium
  },
  timeSep: {
    fontSize: 28,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.medium,
    paddingBottom: 4
  },
  doneBtn: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center'
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.poppins.bold
  },
  pillContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: COLORS.black2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
    zIndex: 10,
  },
  pillSeparator: {
    width: 1,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginTop: 15
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.poppins.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40
  },
});
