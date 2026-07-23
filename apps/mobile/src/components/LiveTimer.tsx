import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '../theme';

interface LiveTimerProps {
  endTime: string | null | undefined;
  onEnd?: () => void;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
}

export const LiveTimer: React.FC<LiveTimerProps> = ({
  endTime,
  onEnd,
  textStyle,
  containerStyle,
  label
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('--:--:--');
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(endTime) - +new Date();

      if (difference <= 0) {
        setTimeLeft('Ended');
        setIsCritical(true);
        onEnd?.();
        return false;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Set critical if less than 5 minutes left
      setIsCritical(difference < 5 * 60 * 1000);

      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');

      setTimeLeft(`${hStr}:${mStr}:${sStr}`);
      return true;
    };

    calculateTimeLeft();
    const timer = setInterval(() => {
      if (!calculateTimeLeft()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={[
        styles.timer,
        isCritical && styles.critical,
        textStyle
      ]}>
        {timeLeft}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  timer: {
    fontSize: 14,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.bold,
  },
  critical: {
    color: COLORS.coral,
  },
});
