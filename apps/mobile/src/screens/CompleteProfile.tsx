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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { updateUser } from '../api';

export default function CompleteProfile() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isDealer = user?.userType === 'DEALER';

  const handleNext = async () => {
    if (!address || !city || !zipCode) return;
    setLoading(true);
    try {
      const { user: updatedUser } = await updateUser(user?.id || '', { businessName, address, city, zipCode });
      setUser(updatedUser);
      navigation.navigate('Kyc');
    } catch (err: any) {
      console.warn('Update profile failed', err);
      alert(err.message || 'Failed to update profile. Please try again.');
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
<<<<<<< HEAD
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
=======
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  form: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginLeft: 4,
  },
  inputContainer: {
<<<<<<< HEAD
    height: 58,
    borderWidth: 1.5,
=======
    height: 44,
    borderWidth: 1,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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
    fontFamily: FONTS.poppins.medium,
  },
  primaryBtn: {
    backgroundColor: COLORS.secondary,
<<<<<<< HEAD
    height: 58,
    borderRadius: 16,
=======
    height: 50,
    borderRadius: 5,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
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
    fontFamily: FONTS.poppins.extraBold,
    letterSpacing: 1,
  },
});

