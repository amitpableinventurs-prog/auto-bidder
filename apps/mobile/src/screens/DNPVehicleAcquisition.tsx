import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { request } from '../api';

export default function DNPVehicleAcquisitionScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerCity: '',
    preferredContactTime: '',
    brand: '',
    model: '',
    variant: '',
    year: '',
    regNumber: '',
    fuelType: '',
    transmission: '',
    kmsDriven: '',
    expectedPrice: '',
    location: '',
    notes: '',
  });

  const handleInputChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.sellerName || !form.sellerPhone || !form.brand || !form.model || !form.regNumber || !form.expectedPrice) {
      Alert.alert('Missing Information', 'Please fill all required fields marked with *');
      return false;
    }
    if (form.sellerPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        year: parseInt(form.year),
        kmsDriven: parseInt(form.kmsDriven),
        expectedPrice: parseInt(form.expectedPrice),
        images: [], // Images would be handled by an upload service in a full implementation
      };

      const data = await request<any>('/api/dnp/vehicle-leads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      Alert.alert(
        'Success!',
        'Vehicle acquisition lead submitted successfully. Our team will review the details and get back to you.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Bring a Car</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introBox}>
            <Text style={styles.introTitle}>Submit a Vehicle Lead</Text>
            <Text style={styles.introText}>Enter details of the seller and the vehicle. Once verified and approved, you will earn a commission.</Text>
          </View>

          {/* Seller Information */}
          <SectionTitle title="Seller Information" icon="person-outline" />
          <Input label="Full Name *" placeholder="Enter seller name" value={form.sellerName} onChangeText={(v) => handleInputChange('sellerName', v)} />
          <Input label="Mobile Number *" placeholder="10-digit mobile number" keyboardType="phone-pad" value={form.sellerPhone} onChangeText={(v) => handleInputChange('sellerPhone', v)} maxLength={10} />
          <Input label="Email (Optional)" placeholder="seller@example.com" keyboardType="email-address" value={form.sellerEmail} onChangeText={(v) => handleInputChange('sellerEmail', v)} />
          <Input label="City *" placeholder="e.g. Mumbai" value={form.sellerCity} onChangeText={(v) => handleInputChange('sellerCity', v)} />
          <Input label="Preferred Contact Time" placeholder="e.g. Evening after 6 PM" value={form.preferredContactTime} onChangeText={(v) => handleInputChange('preferredContactTime', v)} />

          <View style={styles.sectionDivider} />

          {/* Vehicle Information */}
          <SectionTitle title="Vehicle Information" icon="car-outline" />
          <Input label="Brand *" placeholder="e.g. Maruti Suzuki" value={form.brand} onChangeText={(v) => handleInputChange('brand', v)} />
          <Input label="Model *" placeholder="e.g. Swift" value={form.model} onChangeText={(v) => handleInputChange('model', v)} />
          <Input label="Variant" placeholder="e.g. VXI" value={form.variant} onChangeText={(v) => handleInputChange('variant', v)} />
          <Input label="Manufacturing Year" placeholder="e.g. 2021" keyboardType="number-pad" value={form.year} onChangeText={(v) => handleInputChange('year', v)} />
          <Input label="Registration Number *" placeholder="e.g. MH01AB1234" value={form.regNumber} onChangeText={(v) => handleInputChange('regNumber', v)} autoCapitalize="characters" />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Fuel Type" placeholder="Petrol/Diesel" value={form.fuelType} onChangeText={(v) => handleInputChange('fuelType', v)} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input label="Transmission" placeholder="Manual/Auto" value={form.transmission} onChangeText={(v) => handleInputChange('transmission', v)} />
            </View>
          </View>

          <Input label="Kilometers Driven" placeholder="e.g. 45000" keyboardType="number-pad" value={form.kmsDriven} onChangeText={(v) => handleInputChange('kmsDriven', v)} />
          <Input label="Expected Price *" placeholder="₹ Amount" keyboardType="number-pad" value={form.expectedPrice} onChangeText={(v) => handleInputChange('expectedPrice', v)} />
          <Input label="Vehicle Location" placeholder="e.g. Bandra West, Mumbai" value={form.location} onChangeText={(v) => handleInputChange('location', v)} />

          <Input label="Additional Notes" placeholder="Any extra details about the car..." value={form.notes} onChangeText={(v) => handleInputChange('notes', v)} multiline numberOfLines={3} />

          <Pressable
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Submit Vehicle Lead</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, icon }: { title: string, icon: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={COLORS.secondary} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

function Input({ label, ...props }: any) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && { height: 100, textAlignVertical: 'top' }]}
        placeholderTextColor={COLORS.grey}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.h6, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  introBox: { backgroundColor: COLORS.lightBlue1, padding: 16, borderRadius: 16, marginBottom: 24 },
  introTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.secondary, marginBottom: 4 },
  introText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionHeaderText: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  sectionDivider: { height: 1, backgroundColor: COLORS.lightGrey2, marginVertical: 24 },
  inputContainer: { marginBottom: 16 },
  label: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginBottom: 8, fontFamily: FONTS.poppins.bold },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.black2,
    ...TYPOGRAPHY.bodySmall,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  submitBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledBtn: { backgroundColor: COLORS.lightGrey1 },
  submitBtnText: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.white },
});
