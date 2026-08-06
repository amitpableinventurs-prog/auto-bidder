import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * Compresses and resizes an image for production upload.
 * Default max dimension is 1600px to balance quality and file size.
 */
export async function compressImage(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri; // Web-specific manipulator is different, skip for now

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }], // Resize to max 1600px width (aspect ratio preserved)
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.warn('[IMAGE_UTILS] Compression failed, using original:', error);
    return uri;
  }
}
