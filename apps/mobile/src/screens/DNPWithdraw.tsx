import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function DNPWithdrawScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'BANK' | 'UPI'>('BANK');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [availableBalance, setAvailableBalance] = useState(8000);

  const handleWithdraw = async () => {
    const withdrawalAmount = parseInt(amount);
    
    if (!withdrawalAmount || withdrawalAmount < 1000) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is ₹1,000');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance');
      return;
    }

    if (withdrawalMethod === 'BANK') {
      if (!bankAccountNumber || !bankIfsc || !accountHolderName) {
        Alert.alert('Missing Details', 'Please fill all bank account details');
        return;
      }
    } else {
      if (!upiId) {
        Alert.alert('Missing Details', 'Please enter your UPI ID');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/dnp/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          bankAccountNumber: withdrawalMethod === 'BANK' ? bankAccountNumber : undefined,
          bankIfsc: withdrawalMethod === 'BANK' ? bankIfsc : undefined,
          bankName: withdrawalMethod === 'BANK' ? bankName : undefined,
          accountHolderName: withdrawalMethod === 'BANK' ? accountHolderName : undefined,
          upiId: withdrawalMethod === 'UPI' ? upiId : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert(
          'Withdrawal Requested',
          'Your withdrawal request has been submitted successfully. It will be processed within 3-5 business days after admin approval.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Withdrawal Error:', error);
      Alert.alert('Error', 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>Withdraw Earnings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{availableBalance.toLocaleString()}</Text>
          <Text style={styles.balanceNote}>Minimum withdrawal: ₹1,000</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={COLORS.grey}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Pressable style={styles.maxBtn} onPress={() => setAmount(availableBalance.toString())}>
              <Text style={styles.maxBtnText}>MAX</Text>
            </Pressable>
          </View>
        </View>

        {/* Withdrawal Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Method</Text>
          <View style={styles.methodOptions}>
            <Pressable
              style={[styles.methodOption, withdrawalMethod === 'BANK' && styles.methodOptionActive]}
              onPress={() => setWithdrawalMethod('BANK')}
            >
              <Ionicons name="card-outline" size={24} color={withdrawalMethod === 'BANK' ? COLORS.secondary : COLORS.grey} />
              <Text style={[styles.methodOptionText, withdrawalMethod === 'BANK' && styles.methodOptionTextActive]}>
                Bank Transfer
              </Text>
            </Pressable>
            <Pressable
              style={[styles.methodOption, withdrawalMethod === 'UPI' && styles.methodOptionActive]}
              onPress={() => setWithdrawalMethod('UPI')}
            >
              <Ionicons name="logo-google" size={24} color={withdrawalMethod === 'UPI' ? COLORS.secondary : COLORS.grey} />
              <Text style={[styles.methodOptionText, withdrawalMethod === 'UPI' && styles.methodOptionTextActive]}>
                UPI
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Bank Details */}
        {withdrawalMethod === 'BANK' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Account Details</Text>
            <InputField
              label="Account Number"
              placeholder="Enter account number"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              keyboardType="numeric"
            />
            <InputField
              label="IFSC Code"
              placeholder="Enter IFSC code"
              value={bankIfsc}
              onChangeText={setBankIfsc}
              autoCapitalize="characters"
            />
            <InputField
              label="Bank Name"
              placeholder="Enter bank name"
              value={bankName}
              onChangeText={setBankName}
            />
            <InputField
              label="Account Holder Name"
              placeholder="Enter account holder name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />
          </View>
        )}

        {/* UPI Details */}
        {withdrawalMethod === 'UPI' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPI Details</Text>
            <InputField
              label="UPI ID"
              placeholder="example@upi"
              value={upiId}
              onChangeText={setUpiId}
              keyboardType="email-address"
            />
          </View>
        )}

        {/* Withdrawal Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Withdrawal Information</Text>
            <Text style={styles.infoDesc}>
              • Minimum withdrawal: ₹1,000{'\n'}
              • Processing time: 3-5 business days{'\n'}
              • Subject to admin approval and fraud verification{'\n'}
              • Funds will be credited to your selected account
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable 
          style={[styles.withdrawBtn, (!amount || parseInt(amount) < 1000) && styles.withdrawBtnDisabled]}
          onPress={handleWithdraw}
          disabled={!amount || parseInt(amount) < 1000 || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.withdrawBtnText}>Withdraw ₹{amount || '0'}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({ label, placeholder, value, onChangeText, keyboardType, autoCapitalize }: {
  label: string,
  placeholder: string,
  value: string,
  onChangeText: (text: string) => void,
  keyboardType?: any,
  autoCapitalize?: any,
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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
  headerTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h2,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceNote: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey2,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGrey2,
  },
  currencySymbol: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginRight: 12,
  },
  amountInput: {
    ...TYPOGRAPHY.h4,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    flex: 1,
  },
  maxBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  maxBtnText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    fontSize: 12,
  },
  methodOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGrey2,
    backgroundColor: COLORS.white,
  },
  methodOptionActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '10',
  },
  methodOptionText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.textMuted,
  },
  methodOptionTextActive: {
    color: COLORS.secondary,
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGrey2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.black2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: '#9a3412',
    marginBottom: 4,
  },
  infoDesc: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 13,
    color: '#c2410c',
    lineHeight: 20,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  withdrawBtnDisabled: {
    backgroundColor: COLORS.lightGrey1,
    shadowOpacity: 0,
    elevation: 0,
  },
  withdrawBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
    fontSize: 16,
  },
});
