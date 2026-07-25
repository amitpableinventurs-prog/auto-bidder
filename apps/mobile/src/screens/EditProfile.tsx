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
  Alert,
  Image,
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
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  businessName: z.string().optional(),
});

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (!city && user.city) setCity(user.city);
      if (!businessName && user.businessName) setBusinessName(user.businessName);
      if (!avatarUrl && user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0].uri) {
      try {
        setUploading(true);
        const uploadRes = await uploadFile(result.assets[0].uri, result.assets[0].mimeType, result.assets[0].fileName || undefined);
        setAvatarUrl(uploadRes.url);
      } catch (err) {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    const result = profileSchema.safeParse({
        name,
        email,
        city,
        businessName,
    });

    if (!result.success) {
        Alert.alert('Validation Error', result.error.errors[0].message);
        return;
    }

    setLoading(true);
    try {
      const { user: updatedUser } = await updateUser(user?.id || '', {
        name,
        email,
        city,
        businessName,
        avatarUrl
      });
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default', editable = true }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
        <Ionicons name={icon} size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.textDim}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={COLORS.accent} /> : <Text style={styles.saveText}>Save</Text>}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }}
              style={styles.avatar}
            />
            <Pressable style={styles.cameraBtn} onPress={handlePickImage} disabled={uploading}>
              {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="camera" size={20} color="#FFF" />}
            </Pressable>
          </View>
          <Text style={styles.avatarHint}>Tap camera to change profile picture</Text>
        </View>

        <View style={styles.form}>
            <InputField
                label="FULL NAME"
                value={name}
                onChangeText={setName}
                icon="person-outline"
            />
            <InputField
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
            />
            <InputField
                label="PHONE NUMBER"
                value={phone}
                icon="call-outline"
                editable={false}
                subtitle="Phone number cannot be changed"
            />
            <InputField
                label="CITY"
                value={city}
                onChangeText={setCity}
                icon="location-outline"
            />

            {user?.userType === 'DEALER' && (
                <InputField
                    label="BUSINESS NAME"
                    value={businessName}
                    onChangeText={setBusinessName}
                    icon="business-outline"
                />
            )}
        </View>

        <View style={styles.infoBox}>
           <Ionicons name="information-circle-outline" size={20} color={COLORS.blue} />
           <Text style={styles.infoText}>To update your phone number or KYC details, please contact our support team.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', fontFamily: FONTS.poppins.extraBold },
  saveText: { fontSize: 16, fontWeight: '700', color: '#FFC107', fontFamily: FONTS.poppins.bold },
  scrollContent: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 45, backgroundColor: '#F1F5F9' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFC107',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF'
  },
  avatarHint: { fontSize: 12, color: '#94A3B8', marginTop: 12, fontFamily: FONTS.poppins.regular },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: '800', color: '#1E293B', fontFamily: FONTS.poppins.extraBold, marginLeft: 4 },
  inputContainer: {
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  disabledInput: { backgroundColor: '#F1F5F9', borderColor: '#F1F5F9', opacity: 0.7 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1E293B', fontFamily: FONTS.poppins.medium },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBlue1,
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12
  },
  infoText: { flex: 1, fontSize: 12, color: COLORS.secondary, lineHeight: 18, fontFamily: FONTS.poppins.medium }
});
