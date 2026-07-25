import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { updateUser, uploadFile } from '../api';
import * as ImagePicker from 'expo-image-picker';

export default function CompleteProfile() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | null>(null);
  const [avatar, setAvatar] = useState(user?.avatarUrl || null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      if (!businessName && user.businessName) setBusinessName(user.businessName);
      if (!address && user.address) setAddress(user.address);
      if (!city && user.city) setCity(user.city);
      if (!zipCode && user.zipCode) setZipCode(user.zipCode);
      if (!avatar && user.avatarUrl) setAvatar(user.avatarUrl);
    }
  }, [user]);

  const isDealer = user?.userType === 'DEALER';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0].uri) {
      setUploading(true);
      try {
        const uploadResult = await uploadFile(result.assets[0].uri);
        setAvatar(uploadResult.url);
      } catch (err) {
        Alert.alert('Upload Error', 'Failed to upload profile picture.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleNext = async () => {
    if (!address || !city || !zipCode) {
      return Alert.alert('Missing Info', 'Please fill in all the required address fields.');
    }

    setLoading(true);
    try {
      const payload: any = { businessName, address, city, zipCode, avatarUrl: avatar };
      if (gender) payload.gender = gender;

      const { user: updatedUser } = await updateUser(user?.id || '', payload);
      setUser(updatedUser);
      navigation.navigate('Kyc');
    } catch (err: any) {
      console.warn('Update profile failed', err);
      Alert.alert('Error', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Header */}
      <View style={styles.topSection}>
        <SafeAreaView style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </Pressable>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '50%' }]} />
            </View>
        </SafeAreaView>

        <View style={styles.titleWrap}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.subtitle}>{isDealer ? 'Set up your showroom profile.' : 'Help us know you better for a seamless bidding experience.'}</Text>
        </View>
      </View>

      {/* White Content Area */}
      <View style={styles.content}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Profile Picture Section */}
            <View style={styles.avatarSection}>
                <Pressable onPress={pickImage} style={styles.avatarWrapper}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="camera" size={32} color={COLORS.textMuted} />
                        </View>
                    )}
                    {uploading && (
                        <View style={styles.uploadOverlay}>
                            <ActivityIndicator color={COLORS.white} />
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Ionicons name="pencil" size={14} color={COLORS.white} />
                    </View>
                </Pressable>
                <Text style={styles.avatarLabel}>Profile Picture</Text>
            </View>

            <View style={styles.form}>
              {isDealer && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>BUSINESS / SHOWROOM NAME</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="store-outline" size={20} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Premium Auto Hub"
                      placeholderTextColor={COLORS.textMuted}
                      value={businessName}
                      onChangeText={setBusinessName}
                    />
                  </View>
                </View>
              )}

              {!isDealer && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>GENDER</Text>
                    <View style={styles.genderRow}>
                        {['MALE', 'FEMALE', 'OTHER'].map((item) => (
                            <Pressable
                                key={item}
                                style={[styles.genderBtn, gender === item && styles.genderBtnActive]}
                                onPress={() => setGender(item as any)}
                            >
                                <Text style={[styles.genderBtnText, gender === item && styles.genderBtnTextActive]}>
                                    {item}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{isDealer ? 'SHOWROOM ADDRESS' : 'STREET ADDRESS'}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="123 Auction Street"
                    placeholderTextColor={COLORS.textMuted}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>CITY</Text>
                    <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Bengaluru"
                        placeholderTextColor={COLORS.textMuted}
                        value={city}
                        onChangeText={setCity}
                    />
                    </View>
                </View>
                <View style={[styles.inputGroup, { width: 120 }]}>
                    <Text style={styles.label}>ZIP CODE</Text>
                    <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="560001"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="number-pad"
                        value={zipCode}
                        onChangeText={setZipCode}
                        maxLength={6}
                    />
                    </View>
                </View>
              </View>

              <Pressable
                style={[styles.primaryBtn, (loading || !address || !city || !zipCode) && styles.btnDisabled]}
                onPress={handleNext}
                disabled={loading || !address || !city || !zipCode}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>CONTINUE TO KYC</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                  </>
                )}
              </Pressable>

              <Pressable onPress={() => navigation.navigate('MainDrawer')} style={styles.skipBtn}>
                <Text style={styles.skipText}>I'll do this later</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkNavy,
  },
  topSection: {
    height: 180,
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginLeft: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  titleWrap: {
    marginTop: 10,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGrey2,
    borderWidth: 3,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 8,
    fontFamily: FONTS.poppins.semiBold,
    color: COLORS.textMuted,
  },
  form: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  genderBtnText: {
    fontSize: 13,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.textMuted,
  },
  genderBtnTextActive: {
    color: COLORS.white,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginLeft: 4,
  },
  inputContainer: {
    height: 58,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.black2,
    fontFamily: FONTS.poppins.semiBold,
  },
  primaryBtn: {
    backgroundColor: COLORS.secondary,
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    letterSpacing: 1,
  },
  skipBtn: {
    alignItems: 'center',
    marginTop: 10,
  },
  skipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontFamily: FONTS.poppins.medium,
    textDecorationLine: 'underline',
  },
});
