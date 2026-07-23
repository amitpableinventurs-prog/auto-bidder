<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
﻿import React, { useState } from 'react';
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
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
    if (!name || !email) {
      Alert.alert('Error', 'Name and Email are required');
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
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={19} color={editable ? COLORS.secondary : COLORS.textMuted} />
        </View>
        <TextInput
          style={[styles.input, !editable && styles.inputDisabledText]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable}
          placeholder={`Enter ${label.toLowerCase().replace(' address', '').replace(' number', '')}`}
          placeholderTextColor={COLORS.textDim}
        />
        {!editable && (
          <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
        )}
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
  scrollContent: { padding: 24, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 36 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F1F5F9', borderWidth: 3, borderColor: '#FFC107' },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFC107',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFF',
    elevation: 3,
  },
  avatarHint: { fontSize: 12, color: '#94A3B8', marginTop: 10, fontFamily: FONTS.poppins.regular, letterSpacing: 0.2 },
  form: { gap: 0 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: FONTS.poppins.bold,
    marginLeft: 2,
    marginBottom: 7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,193,7,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
<<<<<<< HEAD
  avatarHint: { fontSize: 12, color: '#94A3B8', marginTop: 12, fontFamily: FONTS.poppins.regular },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: '800', color: '#1E293B', fontFamily: FONTS.poppins.extraBold, marginLeft: 4 },
=======
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E8EDF5',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  disabledInput: { backgroundColor: '#FAFBFC', borderColor: '#EEF0F4', borderStyle: 'dashed' },
  input: { flex: 1, fontSize: 15, color: '#1E293B', fontFamily: FONTS.poppins.medium, includeFontPadding: false },
  inputDisabledText: { color: '#94A3B8' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 14,
    marginTop: 28,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: { flex: 1, fontSize: 12, color: '#3B82F6', lineHeight: 19, fontFamily: FONTS.poppins.medium }
});
