import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from '../theme';

const { width } = Dimensions.get('window');

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date | null;
  title?: string;
  allowPastDates?: boolean;
}

export default function CalendarModal({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  title = "Select Date",
  allowPastDates = true
}: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();

    // Get previous month days to fill the first week
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevDays.push({ day: prevMonthDaysCount - i, current: false });
    }

    // Current month days
    const currentDays = [];
    for (let i = 1; i <= daysCount; i++) {
      currentDays.push({ day: i, current: true });
    }

    // Next month days to fill the grid (total 42 cells for 6 weeks)
    const nextDaysCount = 42 - prevDays.length - currentDays.length;
    const nextDays = [];
    for (let i = 1; i <= nextDaysCount; i++) {
      nextDays.push({ day: i, current: false });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isToday = (day: number, isCurrent: boolean) => {
    if (!isCurrent) return false;
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear();
  };

  const isDateSelected = (day: number, isCurrent: boolean) => {
    if (!isCurrent || !selectedDate) return false;
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentMonth.getMonth() &&
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const isPast = (day: number, isCurrent: boolean) => {
    if (!isCurrent) return false;
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj < today;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent={true}>
<<<<<<< HEAD
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.calendarCard} onPress={e => e.stopPropagation()}>
          <View style={styles.monthNav}>
            <Text style={styles.monthText}>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.navArrows}>
              <Pressable onPress={() => changeMonth(-1)} hitSlop={10} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={24} color="#161829" />
              </Pressable>
              <Pressable onPress={() => changeMonth(1)} hitSlop={10} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={24} color="#161829" />
=======
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.calendarCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={COLORS.black2} />
            </Pressable>
          </View>

          <View style={styles.monthNav}>
            {/* Year row */}
            <View style={styles.navRow}>
              <Pressable onPress={() => changeMonth(-12)} hitSlop={10} style={styles.navBtnSmall}>
                <Ionicons name="chevron-back" size={16} color={COLORS.black2} />
              </Pressable>
              <Text style={styles.yearText}>{currentMonth.getFullYear()}</Text>
              <Pressable onPress={() => changeMonth(12)} hitSlop={10} style={styles.navBtnSmall}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.black2} />
              </Pressable>
            </View>
            {/* Month row */}
            <View style={styles.navRow}>
              <Pressable onPress={() => changeMonth(-1)} hitSlop={10} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={COLORS.black2} />
              </Pressable>
              <Text style={styles.monthText}>
                {currentMonth.toLocaleString('default', { month: 'long' })}
              </Text>
              <Pressable onPress={() => changeMonth(1)} hitSlop={10} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.black2} />
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
              </Pressable>
            </View>
          </View>

          <View style={styles.weekRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <Text key={i} style={styles.weekText}>{day}</Text>
            ))}
          </View>

          <View style={styles.separator} />

          <View style={styles.daysGrid}>
            {daysInMonth.map((d, i) => {
              const selected = isDateSelected(d.day, d.current);
              const disabled = !allowPastDates && isPast(d.day, d.current);
              const notCurrent = !d.current;

              return (
                <Pressable
                  key={i}
                  style={[
                    styles.dayBox,
                    selected && styles.dayBoxSelected,
                    isToday(d.day, d.current) && !selected && styles.dayBoxToday
                  ]}
                  onPress={() => {
                    if (d.current && !disabled) {
                      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d.day);
                      onSelectDate(dateObj);
                    }
                  }}
                  disabled={notCurrent || disabled}
                >
                  <Text style={[
                    styles.dayText,
                    notCurrent && styles.dayTextMuted,
                    disabled && styles.dayTextDisabled,
                    selected && styles.dayTextSelected
                  ]}>
                    {d.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>CANCEL</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCard: {
    width: width * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthNav: {
    flexDirection: 'column',
    justifyContent: 'space-between',
<<<<<<< HEAD
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  navArrows: {
    flexDirection: 'row',
    gap: 15,
=======
    alignItems: 'stretch',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  },
  navBtn: {
    padding: 5,
  },
  monthText: {
    fontSize: 20,
    fontFamily: FONTS.poppins.bold,
    color: '#161829',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  weekText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONTS.poppins.medium,
    color: COLORS.black1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  dayBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  dayBoxSelected: {
    backgroundColor: COLORS.secondary,
  },
  dayBoxToday: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  dayText: {
    fontSize: 16,
    fontFamily: FONTS.poppins.medium,
    color: COLORS.black1,
  },
  dayTextSelected: {
    color: COLORS.white,
    fontFamily: FONTS.poppins.bold,
  },
  dayTextMuted: {
    color: '#cbd5e1',
  },
  dayTextDisabled: {
    color: '#e2e8f0',
    textDecorationLine: 'line-through',
  },
  footer: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeBtnText: {
    fontSize: 14,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.grey,
  },
});
