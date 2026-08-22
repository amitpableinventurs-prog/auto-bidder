import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../theme';

interface SliderMediaProps {
  mediaType?: 'IMAGE' | 'GIF' | 'VIDEO';
  imageUrl: string;
  videoUrl?: string | null;
  isActive?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  style?: any;
}

export default function SliderMedia({
  mediaType = 'IMAGE',
  imageUrl,
  videoUrl,
  isActive = false,
  resizeMode = 'cover',
  style,
}: SliderMediaProps) {
  const isFocused = useIsFocused();
  const isVideo = mediaType === 'VIDEO';
  const finalVideoUrl = videoUrl || imageUrl; // Fallback if videoUrl is missing but type is VIDEO

  const player = useVideoPlayer(isVideo ? finalVideoUrl : null, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (isVideo && player) {
      if (isActive && isFocused) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, isFocused, isVideo, player]);

  if (isVideo && finalVideoUrl) {
    return (
      <View style={[styles.container, style]}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit={resizeMode}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      </View>
    );
  }

  // Fallback to Image for IMAGE and GIF
  return (
    <Image
      source={{ uri: imageUrl }}
      style={[styles.image, style]}
      resizeMode={resizeMode}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
