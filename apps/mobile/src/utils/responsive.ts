import { useWindowDimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isSmallPhone = width < 360;
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const contentMaxWidth = isDesktop ? 1200 : isTablet ? 960 : width;
  const horizontalPadding = isDesktop ? 24 : isTablet ? 20 : 12;
  const gridColumns = isDesktop ? 5 : isTablet ? 4 : 3;

  return {
    width,
    height,
    isWeb,
    isSmallPhone,
    isPhone,
    isTablet,
    isDesktop,
    contentMaxWidth,
    horizontalPadding,
    gridColumns,
  };
}

export function getResponsiveCardWidth(width: number, columns: number, gap: number, padding: number) {
  return (width - padding * 2 - gap * (columns - 1)) / columns;
}
