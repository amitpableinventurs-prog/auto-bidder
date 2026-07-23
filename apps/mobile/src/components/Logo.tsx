import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle, useWindowDimensions, Image } from 'react-native';

// Import the HD logo asset
const hdLogo = require('../../assets/hdlogo.png');

interface LogoProps {
  source?: any; // Optional custom source
  size?: number; // Optional base size for scaling
  width?: number; // Explicit width overrides responsive scaling
  height?: number; // Explicit height overrides responsive scaling
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  margin?: number;
  padding?: number;
}

/**
 * Responsive Logo component for the AutoBidder app using hdlogo.png asset by default.
 * Scaled based on screen width while maintaining the requested aspect ratio.
 */
export default function Logo({
  source,
  size,
  width,
  height,
  style,
  imageStyle,
  margin = 0,
  padding = 0,
}: LogoProps) {
  const { width: screenWidth } = useWindowDimensions();

  // Base dimensions - we'll keep the same relative sizing as before
  const BASE_WIDTH = 160;
  const BASE_HEIGHT = 22;
  const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

  // Scaling factor based on standard mobile width (approx 375-400)
  const scaleFactor = Math.min(Math.max(screenWidth / 375, 1), 1.5);

  // Determine final dimensions
  const finalHeight = height ?? (size ?? BASE_HEIGHT * scaleFactor);
  const finalWidth = width ?? (finalHeight * ASPECT_RATIO);

  return (
    <View style={[
      styles.container,
      { margin, padding },
      style
    ]}>
      <Image
        source={source ?? hdLogo}
        style={[
          {
            width: finalWidth,
            height: finalHeight,
          },
          imageStyle
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
