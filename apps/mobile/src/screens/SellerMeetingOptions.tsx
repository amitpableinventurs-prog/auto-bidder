import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { createAppointment } from '../api';
import Logo from '../components/Logo';
import { COLORS, FONTS, TYPOGRAPHY } from '../theme';

const { width } = Dimensions.get('window');

export default function SellerMeetingOptions() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SellerMeetingOptions'>>();
  const { listingId, userId } = route.params;

  const [step, setStep] = useState<'options' | 'date' | 'time'>('options');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState({ hour: 12, minute: 0, period: 'AM' });
  const [inspectionType, setInspectionType] = useState('BUYER_INSPECTION');

  const onBack = () => navigation.goBack();

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

  const changeMonth = (offset: number) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(next);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date first');
      setStep('date');
      return;
    }

    setSubmitting(true);
    try {
      const scheduledDate = new Date(selectedDate);
      let hour = time.hour;
      if (time.period === 'PM' && hour !== 12) hour += 12;
      if (time.period === 'AM' && hour === 12) hour = 0;
      scheduledDate.setHours(hour, time.minute, 0, 0);

      await createAppointment(
        listingId,
        userId,
        inspectionType,
        scheduledDate.toISOString()
      );
      setSubmitting(false);
      Alert.alert('Success', 'Meeting scheduled successfully', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to schedule meeting. Please try again.');
    }
  };

  const renderOptions = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Schedule Meeting with the seller</Text>

      {/* Card 1 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="file-search-outline" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.cardTitle}>Get the inspection Report</Text>
        </View>
        <Text style={styles.cardDesc}>
          Lorem ipsum dolor sit amet consectetur. Sagittis molestie eu lectus metus.
        </Text>
        <Pressable
          style={styles.outlineBtn}
          onPress={() => { setInspectionType('INSPECTION_REPORT'); setStep('date'); }}
        >
          <Text style={styles.outlineBtnText}>SCHEDULE MEETING</Text>
        </Pressable>
      </View>

      {/* Card 2 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="file-search-outline" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.cardTitle}>Get inspected by third party authorized center</Text>
        </View>
        <Text style={styles.cardDesc}>
          Lorem ipsum dolor sit amet consectetur. Sagittis molestie eu lectus metus.
        </Text>
        <Pressable
          style={styles.outlineBtn}
          onPress={() => { setInspectionType('THIRD_PARTY_INSPECTION'); setStep('date'); }}
        >
          <Text style={styles.outlineBtnText}>SCHEDULE MEETING</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={15} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={COLORS.black2} />
        </Pressable>
        <Logo />
      </View>

      {renderOptions()}

      {/* The Pill from Screenshot 4 */}
      <View style={styles.pillContainer}>
        <Pressable hitSlop={10}><Ionicons name="chevron-back" size={22} color={COLORS.white} /></Pressable>
        <View style={styles.pillSeparator} />
        <Pressable hitSlop={10}><Ionicons name="chevron-forward" size={22} color={COLORS.white} /></Pressable>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={step === 'date'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStep('options')} />
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => changeMonth(-1)} hitSlop={10}>
                <Ionicons name="chevron-back" size={20} color={COLORS.black2} />
              </Pressable>
              <Text style={styles.monthText}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <Pressable onPress={() => changeMonth(1)} hitSlop={10}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.black2} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <Text key={i} style={styles.weekText}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {daysInMonth.map((d, i) => {
                const isSelected = selectedDate &&
                                  selectedDate.getDate() === d.day &&
                                  selectedDate.getMonth() === currentMonth.getMonth() &&
                                  selectedDate.getFullYear() === currentMonth.getFullYear() &&
                                  d.current;
                return (
                  <Pressable
                    key={i}
                    style={[styles.dayBox, isSelected && styles.dayBoxActive]}
                    onPress={() => {
                      if (d.current) {
                        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d.day);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        if (clickedDate.getTime() < today.getTime()) {
                           // Option: visually mute past dates or alert
                           return;
                        }
                        setSelectedDate(clickedDate);
                        setStep('time');
                      }
                    }}
                  >
                    <Text style={[
                      styles.dayText,
                      (!d.current || new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d.day).getTime() < new Date().setHours(0,0,0,0)) && styles.dayTextMuted,
                      isSelected && styles.dayTextActive
                    ]}>{d.day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={step === 'time'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStep('date')} />
          <View style={styles.timeCard}>
            <View style={styles.timePickerRow}>
              <View style={styles.timeCol}>
                <Pressable onPress={() => setTime(prev => ({ ...prev, hour: prev.hour === 12 ? 1 : prev.hour + 1 }))}>
                  <Ionicons name="chevron-up" size={24} color={COLORS.darkGrey} />
                </Pressable>
                <Text style={styles.timeVal}>{time.hour.toString().padStart(2, '0')}</Text>
                <Pressable onPress={() => setTime(prev => ({ ...prev, hour: prev.hour === 1 ? 12 : prev.hour - 1 }))}>
                  <Ionicons name="chevron-down" size={24} color={COLORS.darkGrey} />
                </Pressable>
              </View>

              <Text style={styles.timeSep}>:</Text>

              <View style={styles.timeCol}>
                <Pressable onPress={() => setTime(prev => ({ ...prev, minute: (prev.minute + 5) % 60 }))}>
                  <Ionicons name="chevron-up" size={24} color={COLORS.darkGrey} />
                </Pressable>
                <Text style={styles.timeVal}>{time.minute.toString().padStart(2, '0')}</Text>
                <Pressable onPress={() => setTime(prev => ({ ...prev, minute: prev.minute < 5 ? 55 : prev.minute - 5 }))}>
                  <Ionicons name="chevron-down" size={24} color={COLORS.darkGrey} />
                </Pressable>
              </View>

              <View style={styles.timeCol}>
                <Pressable onPress={() => setTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }))}>
                  <Ionicons name="chevron-up" size={24} color={COLORS.darkGrey} />
                </Pressable>
                <Text style={styles.timeVal}>{time.period}</Text>
                <Pressable onPress={() => setTime(prev => ({ ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' }))}>
                  <Ionicons name="chevron-down" size={24} color={COLORS.darkGrey} />
                </Pressable>
              </View>
            </View>

            <Pressable style={[styles.doneBtn, submitting && { opacity: 0.7 }]} onPress={handleComplete} disabled={submitting}>
              {submitting
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.doneBtnText}>DONE</Text>
              }
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: { marginRight: 15 },
  content: { padding: 20 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  dayTextMuted: {
    color: COLORS.grey
  },
  timeCard: {
    width: width * 0.75,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
});
