import { Platform, ViewStyle } from 'react-native';

export const COLORS = {
  primary: '#FFC107', // Yellow
  secondary: '#246EB9', // Blue
  lightBlue1: '#E9F0F8',
  lightBlue2: '#D3E2F1',
  darkNavy: '#161829', // Dark Navy
  coral: '#FF6F61', // Coral
  red: '#EF4444', // Red
  gold: '#FFD700', // Gold

  black1: '#000000',
  black2: '#151515',
  darkGrey: '#555555',
  grey: '#CCCCCC',
  lightGrey1: '#DFDFDF',
  lightGrey2: '#F2F2F2',
  white: '#FFFFFF',

  // Semantic mappings
  text: '#151515',
  textMuted: '#555555',
  border: '#CCCCCC',
  background: '#FFFFFF',
  surface: '#F2F2F2',
  error: '#FF6F61',
  formError: '#FF473C',
  success: '#4CAF50',
  accent: '#FFC107',
  textDim: '#94a3b8',
  blue: '#246EB9',
  textLight: '#cbd5e1',
};

export const TAB_BAR_HEIGHT = 120;

export const FONTS = {
  poppins: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extraBold: 'Poppins_800ExtraBold',
    black: 'Poppins_900Black',
  },
  openSans: {
    regular: 'OpenSans_400Regular',
    semiBold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 30,
    lineHeight: 42,
  },
  h2: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 28,
    lineHeight: 40,
  },
  h3: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 26,
    lineHeight: 38,
  },
  h4: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 24,
    lineHeight: 36,
  },
  h5: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 22,
    lineHeight: 34,
  },
  h6: {
    fontFamily: FONTS.poppins.bold,
    fontSize: 20,
    lineHeight: 32,
  },
  bodyLarge: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 20,
    lineHeight: 30,
  },
  bodyMediumLarge: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMedium: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 16,
    lineHeight: 26,
  },
  body14: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 14,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FONTS.openSans.regular,
    fontSize: 12,
    lineHeight: 22,
  },
};

/**
 * Platform-agnostic shadow helper to avoid Web deprecation warnings
 */
export const getShadow = (
  offsetX: number = 0,
  offsetY: number = 2,
  opacity: number = 0.1,
  radius: number = 4,
  color: string = '#000000',
  elevation: number = 3
): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      // @ts-ignore - boxShadow is supported in newer RN but maybe not in current types
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};
